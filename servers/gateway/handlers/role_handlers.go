package handlers

import (
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// RolesHandler handles all requests for the roles resource
func (ctx *AuthContext) RolesHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeRole) {
			return permissionDenied()
		}
		// handle getting all roles
		roles, err := ctx.store.GetRoles()
		if err != nil {
			return middleware.HTTPErrorFromDBErrorContext(err, "error querying roles")
		}
		return respond(w, roles, http.StatusOK)
	default:
		return methodNotAllowed()
	}
}

// SpecificRoleHandler handles requests for specific roles
func (ctx *AuthContext) SpecificRoleHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeRole) {
			return permissionDenied()
		}
		targetRole := vars["id"]
		// handle getting all roles
		if targetRole == "all" || targetRole == "" {
			roles, err := ctx.store.GetRoles()
			if err != nil {
				return middleware.HTTPErrorFromDBErrorContext(err, "error querying roles")
			}
			return respond(w, roles, http.StatusOK)
		}

		// handle getting a specific role id
		targetRoleInt, err := strconv.Atoi(targetRole)
		if err != nil {
			return unparsableIDGiven()
		}
		role, dbErr := ctx.store.GetRoleByID(targetRoleInt)
		if dbErr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dbErr, "error querying roles")
		}
		return respond(w, role, http.StatusOK)
	case "DELETE":
		if !ctx.permChecker.UserCan(u, permissions.DeleteRole) {
			return permissionDenied()
		}
		targetRole := vars["id"]
		targetRoleInt, err := strconv.Atoi(targetRole)
		if err != nil {
			return unparsableIDGiven()
		}
		dbErr := ctx.store.DeleteRoleByID(targetRoleInt)
		if dbErr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dbErr, "error deleting role by id")
		}
		return respondWithString(w, "role deleted and all users with that role changed to normal user", http.StatusOK)
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CreateRole) {
			return permissionDenied()
		}
		newRole := &models.NewRole{}
		err := receive(r, newRole)
		if err != nil {
			return err
		}
		role, dbErr := ctx.store.InsertRole(newRole)
		if dbErr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dbErr, "error querying roles")
		}
		return respond(w, role, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}
