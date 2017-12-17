package models

import (
	"errors"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/Pallinder/go-randomdata"
	"golang.org/x/crypto/bcrypt"
)

// User defines the properties of a specific user in the system
type User struct {
	ID        int64  `json:"id"`
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Email     string `json:"email"`
	PassHash  []byte `json:"-"`
	Role      string `json:"role"`
}

// SetPassword hashes the given password and sets it as this users passHash
func (u *User) SetPassword(password string) error {
	passHash, err := bcrypt.GenerateFromPassword([]byte(password), constants.BCryptDefaultCost)
	if err != nil {
		return err
	}
	u.PassHash = passHash
	return nil
}

// Authenticates the given user with the given password. Returns an error if
// the authentication failed.
func (u *User) Authenticate(password string) error {
	if err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password)); err != nil {
		return errors.New("invalid credentials")
	}
	return nil
}

// generateRandomUser creates a random user and returns it
func generateRandomUser() *User {
	user := &User{
		FirstName: randomdata.FirstName(randomdata.RandomGender),
		LastName:  randomdata.LastName(),
		Email:     randomdata.Email(),
		Role:      string(constants.UserDefaultRole),
	}
	user.SetPassword(randomdata.FirstName(randomdata.RandomGender) + randomdata.Street())
	return user
}
