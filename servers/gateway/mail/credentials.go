package mail

import (
	"net/smtp"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// Credentials defines the information needed to connect to
// a mail account
type Credentials struct {
	User        string
	Password    string
	PermChecker *models.PermissionChecker
}

// toSMTPAuth returns an smtp Auth from "this" mailcredentials
func (mc *Credentials) toSMTPAuth() smtp.Auth {
	return smtp.PlainAuth("", mc.User, mc.Password, gmailBaseAddr)
}
