package mail

import (
	"net/smtp"
)

// MailCredentials defines the information needed to connect to
// a mail account
type MailCredentials struct {
	User     string
	Password string
}

// toSMTPAuth returns an smtp Auth from "this" mailcredentials
func (mc *MailCredentials) toSMTPAuth() smtp.Auth {
	return smtp.PlainAuth("", mc.User, mc.Password, gmailBaseAddr)
}
