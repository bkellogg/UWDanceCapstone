package models

import (
	"errors"
	"net/mail"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
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
		Role:      string(constants.UserDefaultRole),
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
