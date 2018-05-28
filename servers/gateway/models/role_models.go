package models

import (
	"fmt"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// RoleID represents how a role is stored in the system,
type Role struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Level       int64  `json:"level"`
	IsDeleted   bool   `json:"isDeleted"`
}

// NewRole defines the format of a request which
// creates a new user role.
type NewRole struct {
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Level       int64  `json:"level"`
}

// Validate validates the current NewRole.
// Returns an error if one occurred.
// Returns nil if validation was successful.
func (nr *NewRole) Validate() error {
	if len(nr.Name) > appvars.MaxRoleNameLength {
		return fmt.Errorf("role name can only be %d characters long", appvars.MaxRoleNameLength)
	}
	if len(nr.Name) == 0 {
		return fmt.Errorf("role name must exist")
	}
	if len(nr.DisplayName) == 0 {
		return fmt.Errorf("role display name must exist")
	}
	if len(nr.DisplayName) > appvars.MaxRoleDisplayNameLength {
		return fmt.Errorf("role display name can only be %d characters long", appvars.MaxRoleDisplayNameLength)
	}
	nr.Name = strings.TrimSpace(nr.Name)
	nr.DisplayName = strings.TrimSpace(nr.DisplayName)
	nr.Name = strings.ToLower(strings.Replace(nr.Name, " ", "_", -1))

	nr.DisplayName = strings.Title(strings.ToLower(nr.DisplayName))
	if nr.Level < 1 || nr.Level > 100 {
		return fmt.Errorf("role level must be between 1 and 100")
	}

	return nil
}
