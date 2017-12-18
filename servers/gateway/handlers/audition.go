package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// AuditionsHandler handles requests for the auditions resource.
func (ctx *AuthContext) AuditionsHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "POST":
		if !u.Can(permissions.CreateAudition) {
			return permissionDenied()
		}
		return respondWithString(w, "TODO", http.StatusNotImplemented)
	default:
		return methodNotAllowed()
	}
}

func (ctx *AuthContext) SpecificAuditionHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	return nil
}
