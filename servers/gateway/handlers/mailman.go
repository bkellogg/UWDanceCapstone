package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
)

func MailHandler(w http.ResponseWriter, r *http.Request, user *models.User) {
	if !user.Can(permissions.SendMail) {
		http.Error(w, "you do not have access to this resource", http.StatusForbidden)
		return
	}
	w.Write([]byte("TODO"))
}
