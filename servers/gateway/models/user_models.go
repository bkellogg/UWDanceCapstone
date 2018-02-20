package models

import (
	"errors"
	"net/mail"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/Pallinder/go-randomdata"
	"golang.org/x/crypto/bcrypt"
)

// NewUserRequest defines the structure of a request for
// a new user sign up
type NewUserRequest struct {
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Email        string `json:"email"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
}

// User defines the properties of a specific user in the system
type User struct {
	ID        int64     `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	PassHash  []byte    `json:"-"`
	Role      int       `json:"role"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"createdAt"`
}

// ToUser takes this *NewUserRequest and returns
// a *User from it
func (u *NewUserRequest) ToUser() (*User, error) {
	if err := u.isReadyForUser(); err != nil {
		return nil, err
	}
	user := &User{
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Role:      constants.UserDefaultRole,
		Active:    constants.UserActive,
		CreatedAt: time.Now(),
	}
	return user, user.SetPassword(u.Password)
}

// isReadyForUser returns nil if this NewUserRequest is able to
// be turned into a user, otherwise returns an error stating
// why it cannot be.
func (u *NewUserRequest) isReadyForUser() error {
	if len(u.FirstName) == 0 {
		return errors.New("new user first name must exist")
	}
	if len(u.LastName) == 0 {
		return errors.New("new user last name must exist")
	}
	if _, err := mail.ParseAddress(u.Email); err != nil {
		return errors.New("new users must supply a valid email address")
	}
	if len(u.Password) < 6 {
		return errors.New("new users must have a password")
	}
	if len(u.Password) != len(u.PasswordConf) {
		return errors.New("passwords did not match")
	}
	return nil
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