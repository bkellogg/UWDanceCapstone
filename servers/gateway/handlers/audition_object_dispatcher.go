package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/mux"
)

// AuditionObjectDispatcher further routes requests requests to the
// auditions/{id}/{object} resource
func (ctx *AuthContext) AuditionObjectDispatcher(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	object := vars["object"]
	switch object {
	case "users":
		if r.Method != "GET" {
			return methodNotAllowed()
		}
		return ctx.handleUsersForAudition(w, r, u)
	default:
		return objectTypeNotSupported()
	}
}
