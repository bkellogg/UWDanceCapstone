package handlers

import (
	"fmt"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// BeginCastingHandler handles requests to begin casting.
func (ctx *AnnouncementContext) BeginCastingHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if !ctx.permChecker.UserIs(u, appvars.PermChoreographer) {
		return permissionDenied()
	}
	client, found := ctx.Notifier.GetClient(u.ID)
	if !found {
		return HTTPError("user must have at least one websocket connection to begin casting", http.StatusNotFound)
	}
	client.AddCasting()
	return respondWithString(w, fmt.Sprintf("success; user id '%d' will now receive casting updates", u.ID), http.StatusOK)
}
