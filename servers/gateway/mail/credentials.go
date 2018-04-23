package mail

import (
	"net/smtp"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// MailCredentials defines the information needed to connect to
// a mail account
type MailCredentials struct {
	User        string
	Password    string
	PermChecker *models.PermissionChecker
}

// toSMTPAuth returns an smtp Auth from "this" mailcredentials
func (mc *MailCredentials) toSMTPAuth() smtp.Auth {
	return smtp.PlainAuth("", mc.User, mc.Password, gmailBaseAddr)
}
