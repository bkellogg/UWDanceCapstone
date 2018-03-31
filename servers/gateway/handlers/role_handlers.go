package handlers

import (
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/mux"
)

// RolesHandler handles all requests for the roles resource
func (ctx *AuthContext) RolesHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	switch r.Method {
	case "GET":
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
	case "POST":
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
