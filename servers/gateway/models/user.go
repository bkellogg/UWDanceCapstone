package models

import (
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/Pallinder/go-randomdata"
	"golang.org/x/crypto/bcrypt"
)

// User defines the properties of a specific user in the system
type User struct {
	ID        int    `json:"id"`
	UserName  string `json:"userName"`
	FirstName string `json:"firstName"`
	Email     string `json:"email"`
	LastName  string `json:"lastName"`
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

// generateRandomUser creates a random user and returns it
func generateRandomUser() *User {
	user := &User{
		UserName:  randomdata.SillyName(),
		FirstName: randomdata.FirstName(randomdata.RandomGender),
		LastName:  randomdata.LastName(),
		Email:     randomdata.Email(),
		Role:      string(constants.UserDefaultRole),
	}
	user.SetPassword(randomdata.FirstName(randomdata.RandomGender) + randomdata.Street())
	return user
}
