package handlers

import (
	"fmt"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
)

// MailHandler handles all mail related requests
func (mc *MailContext) MailHandler(w http.ResponseWriter, r *http.Request, user *models.User) *middleware.HTTPError {
	if !user.Can(permissions.SendMail) {
		return HTTPError(appvars.ErrPermissionDenied, http.StatusForbidden)

	}
	message, err := mail.NewMessageFromRequest(mc.AsMailCredentials(), r)
	if err != nil {
		return HTTPError(fmt.Sprintf("error decoding request into a message: %v", err), http.StatusBadRequest)
	}
	if err = message.Send(); err != nil {
		return HTTPError(fmt.Sprintf("error sending message: %v", err), http.StatusInternalServerError)
	}
	return respondWithString(w, "message sent", 200)
}
