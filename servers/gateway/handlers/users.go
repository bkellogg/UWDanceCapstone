package handlers

import (
	"database/sql"
	"net/http"
	"path"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// AllUsersHandler handles requests for the all users resource
func (ctx *AuthContext) AllUsersHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if r.Method != "GET" {
		return HTTPError("unsupported method", http.StatusMethodNotAllowed)
	}
	if !u.Can(permissions.SeeAllUsers) {
		return HTTPError(errPermissionDenied, http.StatusForbidden)
	}
	users, err := ctx.Database.GetAllUsers()
	if err != nil {
		return HTTPError("error getting users: "+err.Error(), http.StatusInternalServerError)
	}
	return respond(w, users, http.StatusOK)
}

// SpecificUserHandler handles requests for a specifc user
func (ctx *AuthContext) SpecificUserHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	_, userIDString := path.Split(r.URL.Path)
	var userID int
	var err error
	if userIDString == "me" {
		userID = int(u.ID)
	} else {
		userID, err = strconv.Atoi(userIDString)
		if err != nil {
			return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
		}
	}
	switch r.Method {
	case "GET":
		if !u.CanSeeUser(userID) {
			return HTTPError(errPermissionDenied, http.StatusForbidden)
		}
		user, err := ctx.Database.GetUserByID(userID)
		if err != nil {
			return HTTPError("error looking up user: "+err.Error(), http.StatusInternalServerError)
		}
		if user == nil {
			return HTTPError("no user found", http.StatusBadRequest)
		}

		return respond(w, user, http.StatusOK)
	case "PATCH":
		if !u.CanModifyUser(userID) {
			return HTTPError(errPermissionDenied, http.StatusForbidden)
		}
		// TODO: Implement this
		return respond(w, "TODO: Implement This", http.StatusOK)
	case "DELETE":
		if !u.CanDeleteUser(userID) {
			return HTTPError(errPermissionDenied, http.StatusForbidden)
		}
		if err := ctx.Database.DeactivateUserByID(userID); err != nil {
			if err != sql.ErrNoRows {
				return HTTPError("error deleting user: "+err.Error(), http.StatusInternalServerError)
			}
			return HTTPError("no user found", http.StatusBadRequest)
		}
		return respondWithString(w, "user has been deleted", 200)
	default:
		return HTTPError(r.Method+" is unsupported", http.StatusMethodNotAllowed)
	}
}
