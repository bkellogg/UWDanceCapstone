package models

import (
	"errors"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

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
	Role      int    `json:"role"`
	Active    bool   `json:"active"`
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

// Authenticate (s) the given user with the given password. Returns an error if
// the authentication failed.
func (u *User) Authenticate(password string) error {
	if err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password)); err != nil {
		return errors.New("invalid credentials")
	}
	return nil
}

// Can returns true if the user has permissions to perform
// the given action
func (u *User) Can(action int) bool {
	return action <= u.Role
}

// CanSeeUser returns true if the user has permissions
// to view the user with the given ID
func (u *User) CanSeeUser(id int) bool {
	return u.hasPermissionTo(permissions.SeeAllUsers, id)
}

// CanModifyUser returns true if the user has permissions
// to modify the user with the given ID
func (u *User) CanModifyUser(id int) bool {
	return u.hasPermissionTo(permissions.ModifyUsers, id)
}

// CanDeleteUser returns true if the user has permissions
// to delete the user with the given ID
func (u *User) CanDeleteUser(id int) bool {
	return u.hasPermissionTo(permissions.DeleteUsers, id)
}

// hasPermissionTo returns true if the user can perform the given
// action on the given user id
func (u *User) hasPermissionTo(action, id int) bool {
	if int(u.ID) == id {
		return true
	}
	return u.Role >= action
}

// generateRandomUser creates a random user and returns it
func generateRandomUser() *User {
	user := &User{
		FirstName: randomdata.FirstName(randomdata.RandomGender),
		LastName:  randomdata.LastName(),
		Email:     randomdata.Email(),
		Role:      constants.UserDefaultRole,
	}
	user.SetPassword(randomdata.FirstName(randomdata.RandomGender) + randomdata.Street())
	return user
}
