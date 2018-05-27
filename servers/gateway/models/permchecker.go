package models

import (
	_ "database/sql"
	"errors"
	"fmt"
	"log"
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
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

	// we need to lock this early because
	// we need to ensure that old roles are not being
	// accessed while we are building the new roleCache
	pc.rc.mx.Lock()
	defer pc.rc.mx.Unlock()
	roles, err := pc.db.GetRoles()
	if err != nil {
		return errors.New(err.Message)
	}

	roleMap := make(map[int64]*Role)
	for _, r := range roles {
		roleMap[r.ID] = r
	}

	pc.rc.roles = roleMap

	return nil
}

// ConvertUserSliceToUserResponseSlice converts the given slice of users to a slice of
// UserResponses. Returns an error if one occurred.
// TODO: THIS FUNCTION SHOULD NOT BE IN THE PERMISSION CHECKER
func (pc *PermissionChecker) ConvertUserSliceToUserResponseSlice(users []*User) ([]*UserResponse, error) {
	urs := make([]*UserResponse, 0, len(users))
	for _, u := range users {
		ur, err := pc.ConvertUserToUserResponse(u)
		if err != nil {
			return nil, errors.New("error converting user to UserResponse: " + err.Error())
		}
		urs = append(urs, ur)
	}
	return urs, nil
}

// ConvertUserToUserResponse converts the given User to a UserResponse.
// Returns an error if the given User contains an a RoleID that doesn't
// correspond to a Role.
// TODO: THIS FUNCTION SHOULD NOT BE IN THE PERMISSION CHECKER
func (pc *PermissionChecker) ConvertUserToUserResponse(u *User) (*UserResponse, error) {
	if pc.rc == nil {
		pc.rc = newRoleCache()
		if err := pc.buildRoleCache(); err != nil {
			return nil, fmt.Errorf("error building role cache: %v", err)
		}
	}
	role := pc.rc.getRole(int64(u.RoleID))
	if role == nil {
		return nil, errors.New("user's roleID does not correspond to a Role")
	}
	return &UserResponse{
		ID:        u.ID,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Bio:       u.Bio,
		Role:      role,
		Active:    u.Active,
		CreatedAt: u.CreatedAt,
	}, nil
}

// FlushRoleCache flushes the role cache inside of the permission
// checker and forces it to rebuild
func (pc *PermissionChecker) FlushRoleCache() error {
	return pc.buildRoleCache()
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

// UserIsAtLeast returns true if the given user is the given role
// or higher. False if otherwise, or if there was an error
// determining this.
func (pc *PermissionChecker) UserIsAtLeast(u *User, role int) bool {
	actualRole, err := pc.getUserRoleLevel(u.ID)
	if err != nil {
		return false
	}
	return actualRole >= role
}

// UserCanSeeUsersInShow returns true if the given user can see users
// inside of the given show.
func (pc *PermissionChecker) UserCanSeeUsersInShow(u *User, show int) bool {
	return pc.UserCan(u, permissions.SeeAllUsers)
}

// UserCanSeeUsersInPiece returns true if the given user can see users
// inside of the given piece.
func (pc *PermissionChecker) UserCanSeeUsersInPiece(u *User, piece int) bool {
	if pc.UserCan(u, permissions.SeeAllUsers) {
		return pc.UserCan(u, permissions.SeeAllUsers)
	}

	ok, err := pc.db.UserIsInPiece(int(u.ID), piece)
	if err != nil {
		log.Printf("error determining if user is in piece: %s", err.Message)
	}
	return ok
}

// UserCanSeePieceInfo returns true if the given user can see the
// given piece's info sheet.
func (pc *PermissionChecker) UserCanSeePieceInfo(u *User, piece int) bool {
	if pc.UserCan(u, appvars.PermChoreographer) {
		return true
	}
	ok, err := pc.db.UserIsInPiece(int(u.ID), piece)
	if err != nil {
		log.Printf("error determining if user is in piece: %s", err.Message)
	}
	return ok
}

// UserCanSeePieceInfo returns true if the given user can see the
// given piece's info sheet.
func (pc *PermissionChecker) UserCanModifyPieceInfo(u *User, pieceID int) bool {
	if pc.UserIsAtLeast(u, appvars.PermAdmin) {
		return true
	}
	piece, err := pc.db.GetPieceByID(pieceID, false)
	if err != nil {
		log.Printf("perm checker: piece does not exist: %v", err)
		return false
	}
	return piece.ChoreographerID == int(u.ID)
}

// UserCanSeeUsersInShow returns true if the given user can see users
// inside of the given show.
func (pc *PermissionChecker) UserCanSeeUsersInAudition(u *User, audition int) bool {
	return pc.UserCan(u, permissions.SeeAllUsers)
}

// UserCanSeeUser returns true if the given user can see the given target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanSeeUser(u *User, target int64) bool {
	if pc.userHasPermissionTo(u, target, permissions.SeeAllUsers) {
		return true
	}
	rows, err := pc.db.db.Query(`SELECT COUNT(DISTINCT P.PieceID)
		AS NumSharedPieces FROM Pieces P JOIN UserPiece UP ON P.PieceID = UP.PieceID
		WHERE EXISTS (
			SELECT * FROM UserPiece WHERE UserID = ? AND PieceID = P.PieceID AND IsDeleted = FALSE
		) AND EXISTS (
			SELECT * FROM UserPiece WHERE UserID = ? AND PieceID = P.PieceID AND IsDeleted = FALSE
		) AND P.IsDeleted = FALSE AND UP.IsDeleted = FALSE`, u.ID, target)
	if err != nil {
		log.Printf("error looking up common pieces between users: %v\n", err)
		return false
	}
	defer rows.Close()
	var numPiecesInCommon int64
	if !rows.Next() {
		return false
	}
	if err = rows.Scan(&numPiecesInCommon); err != nil {
		log.Printf("error scanning number of common pieces between users: %v\n", err)
		return false
	}
	return numPiecesInCommon > 0
}

// UserCanSeeAvailability returns true if the given user can see the target
// user's availability.
func (pc *PermissionChecker) UserCanSeeAvailability(u *User, target int64) bool {
	return pc.userHasPermissionTo(u, target, permissions.SeeUserAvailability)
}

// UserCanAddToPiece returns true if the given user can add to the given piece ID
func (pc *PermissionChecker) UserCanAddToPiece(u *User, pieceID int64) bool {
	if pc.UserCan(u, permissions.AddUserToPiece) {
		return true
	}
	ok, dberr := pc.db.UserHasInviteForPiece(u.ID, pieceID)
	if dberr != nil {
		log.Printf("error checking user invite for piece: %s", dberr.Message)
	}
	return ok
}

// UserCanRemoveUserFromAudition returns true if the given user can remove users or themselves
// from the given audition.
func (pc *PermissionChecker) UserCanRemoveUserFromAudition(u *User, target int64) bool {
	return pc.userHasPermissionTo(u, target, permissions.RemoveUserFromAudition)
}

// UserCanAddToAudition returns true if the given user can add users to the given
// audition
func (pc *PermissionChecker) UserCanAddToAudition(u *User, target int64) bool {
	return pc.userHasPermissionTo(u, target, permissions.AddUserToAudition)
}

// UserCanModifyUser returns true if the given user can modify the target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanModifyUser(u *User, target int64) bool {
	if target == 1 && u.ID != 1 {
		return false
	}
	return pc.userHasPermissionTo(u, target, permissions.ModifyUsers)
}

// UserCanDeleteUser returns true if the given user can delete the target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanDeleteUser(u *User, target int64) bool {
	if target == 1 && u.ID != 1 {
		return false
	}
	if u.ID == target {
		return true
	}
	return pc.userHasPermissionTo(u, target, permissions.DeleteUsers)
}

// UserCanDeleteUser returns true if the given user can delete the target user,
// false if otherwise.
func (pc *PermissionChecker) UserCanEnableUser(u *User, target int64) bool {
	if target == 1 && u.ID != 1 {
		return false
	}
	if u.ID == target {
		return true
	}
	return pc.userHasPermissionTo(u, target, permissions.DeleteUsers)
}

// userHasPermissionTo returns if the user has permission to perform the given action on the given target
func (pc *PermissionChecker) userHasPermissionTo(u *User, target int64, action int) bool {
	if target == 1 && u.ID != 1 {
		return false
	}
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
