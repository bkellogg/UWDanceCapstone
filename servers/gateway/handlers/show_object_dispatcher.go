package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
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
	default:
		return objectTypeNotSupported()
	}
}
