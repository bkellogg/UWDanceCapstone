package handlers

import (
	"database/sql"
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
				return HTTPError("error getting all roles: "+err.Error(), http.StatusInternalServerError)
			}
			return respond(w, roles, http.StatusOK)
		}

		// handle getting a specific role id
		targetRoleInt, err := strconv.Atoi(targetRole)
		if err != nil {
			return unparsableIDGiven()
		}
		role, err := ctx.store.GetRoleByID(targetRoleInt)
		if err != nil {
			code := http.StatusInternalServerError
			if err == sql.ErrNoRows {
				code = http.StatusBadRequest
			}
			return HTTPError("error getting role by id: "+err.Error(), code)
		}
		return respond(w, role, http.StatusOK)
	case "POST":
		return methodNotAllowed()
	default:
		return methodNotAllowed()
	}
}
