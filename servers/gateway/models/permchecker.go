package models

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

// PermissionChecker represents a checker for checking specific permissions
type PermissionChecker struct {
	db *Database
}

// NewPermissionChecker returns a new permission checker hooked up
// to the given database.
func NewPermissionChecker(db *Database) *PermissionChecker {
	return &PermissionChecker{db: db}
}

// UserCan returns true if the user can do the given basic action.
func (pc *PermissionChecker) UserCan(u *User, action int) bool {
	role, err := pc.getUserRoleLevel(u.ID)
	if err != nil {
		return false
	}
	return role >= action
}

// UserCanSeeUser returns true if the given user can see the given target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanSeeUser(u *User, target int64) bool {
	return pc.userHasPermissionTo(u, target, permissions.SeeAllUsers)
}

// UserCanModifyUser returns true if the given user can modify the target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanModifyUser(u *User, target int64) bool {
	return pc.userHasPermissionTo(u, target, permissions.ModifyUsers)
}

// UserCanDeleteUser returns true if the given user can delete the target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanDeleteUser(u *User, target int64) bool {
	return pc.userHasPermissionTo(u, target, permissions.DeleteUsers)
}

// userHasPermissionTo returns if the
func (pc *PermissionChecker) userHasPermissionTo(u *User, target int64, action int) bool {
	if u.ID == target {
		return true
	}
	return pc.UserCan(u, action)
}

// getUserRoleLevel gets the role level of the given user.
// returns an error if one occurred.
func (pc *PermissionChecker) getUserRoleLevel(uID int64) (int, error) {
	return pc.db.getUserRoleLevel(uID)
}
