package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/mux"
)

// UserObjectDispatcher further routes requests for the users/id/object resource
func (ctx *AuthContext) UserObjectDispatcher(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	resource := vars["object"]
	switch resource {
	case "auditions":
		return ctx.handleUserAudition(w, r, u)
	case "pieces":
		subObject := vars["objectID"]
		if subObject != appvars.CastStatusPending {
			return objectTypeNotSupported()
		}
		targetUser, httperr := parseUserID(r, u)
		if httperr != nil {
			return httperr
		}
		pieces, dberr := ctx.store.GetUserPieceInvites(targetUser)
		if dberr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dberr, "getting pending user pieces")
		}
		if len(pieces) == 0 {
			return HTTPError("user has no pending pieces", http.StatusNotFound)
		}
		return respond(w, pieces, http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}
