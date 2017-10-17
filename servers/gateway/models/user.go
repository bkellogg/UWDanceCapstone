package models

import (
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"golang.org/x/crypto/bcrypt"
)

// User defines the properties of a specific user in the system
type User struct {
	UserName  string `json:"userName"`
	FirstName string `json:"firstName"`
	Email     string `json:"email"`
	LastName  string `json:"lastName"`
	PassHash  []byte `json:"-"`
	Role      int    `json:"role"`
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
