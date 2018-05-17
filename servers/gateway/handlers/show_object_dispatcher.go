package handlers

import (
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// ShowObjectDispatcher further routes requests requests to the
// shows/{id}/{object} resource
func (ctx *AuthContext) ShowObjectDispatcher(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	object := vars["object"]
	switch object {
	case "users":
		if r.Method != "GET" {
			return methodNotAllowed()
		}
		return ctx.handleUsersForShow(w, r, u)
	case "pieces":
		if r.Method != "GET" {
			return methodNotAllowed()
		}
		return ctx.getPiecesForShow(w, r, u)
	case "audition":
		if r.Method != "GET" {
			return methodNotAllowed()
		}
		if !ctx.permChecker.UserCan(u, permissions.SeePieces) {
			return permissionDenied()
		}
		showID, err := strconv.Atoi(vars["id"])
		if err != nil {
			return unparsableIDGiven()
		}
		audition, dberr := ctx.store.GetAuditionByShowID(showID, false)
		if dberr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dberr, "error getting audition by show id")
		}
		return respond(w, audition, http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}
