package handlers

import (
	"fmt"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
)

// MailHandler handles all mail related requests
func (mc *MailContext) MailHandler(w http.ResponseWriter, r *http.Request, user *models.User) {
	if !user.Can(permissions.SendMail) {
		http.Error(w, "you do not have access to this resource", http.StatusForbidden)
		return
	}
	message, err := mail.NewMessageFromRequest(mc.AsMailCredentials(), r)
	if err != nil {
		http.Error(w, fmt.Sprintf("error decoding request into a message: %v", err), http.StatusBadRequest)
		return
	}
	if err = message.Send(); err != nil {
		http.Error(w, fmt.Sprintf("error sending message: %v", err), http.StatusInternalServerError)
		return
	}
	respondWithString(w, "message sent", 200)
}
