package models

import (
	"errors"
	"log"
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
)

// PermissionChecker represents a checker for checking specific permissions
type PermissionChecker struct {
	db *Database
	rc *roleCache
}

// roleCache defines an in memory cache
// that stores roles
type roleCache struct {
	mx    sync.RWMutex
	roles map[int64]*Role
}

// newRoleCache returns am empty role cache.
func newRoleCache() *roleCache {
	return &roleCache{
		roles: make(map[int64]*Role, 1),
	}
}

// getRole gets the role in this role cache with
// the given id
func (rc *roleCache) getRole(id int64) *Role {
	rc.mx.RLock()
	defer rc.mx.RUnlock()
	role, ok := rc.roles[id]
	if !ok {
		log.Printf("%v role ID does not exist in the cache", id)
	}
	return role
}

// buildRoleCache builds the current PermissionChecker's
// cache of roles with the current states that are in
// the current PermissionChecker's database.
func (pc *PermissionChecker) buildRoleCache() error {
	// cannot hold locks on a nil cache
	if pc.rc == nil {
		return errors.New("cannot build a role cache on an empty role cache")
	}
	roles, err := pc.db.GetRoles()
	if err != nil {
		return err
	}

	roleMap := make(map[int64]*Role)
	for _, r := range roles {
		roleMap[r.ID] = r
	}

	pc.rc.mx.Lock()
	pc.rc.roles = roleMap
	pc.rc.mx.Unlock()

	return nil
}

// NewPermissionChecker returns a new permission checker hooked up
// to the given database.
func NewPermissionChecker(db *Database) (*PermissionChecker, error) {
	pc := &PermissionChecker{
		db: db,
		rc: newRoleCache(),
	}
	return pc, pc.buildRoleCache()
}

// UserCan returns true if the user can do the given basic action.
func (pc *PermissionChecker) UserCan(u *User, action int) bool {
	role := pc.rc.getRole(int64(u.RoleID))
	if role == nil {
		return false
	}
	return role.Level >= int64(action)
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
