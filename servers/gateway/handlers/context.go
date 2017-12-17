package handlers

import (
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

// AuthContext defines a list of information that
// handlers performing authentication functions will
// need
type AuthContext struct {
	SessionKey    string
	SessionsStore sessions.Store
	Database      *models.Database
}

// NewAuthContext Creates a new auth context with the given information
func NewAuthContext(sessionKey string, sessionStore sessions.Store, database *models.Database) *AuthContext {
	return &AuthContext{
		SessionKey:    sessionKey,
		SessionsStore: sessionStore,
		Database:      database,
	}
}

// MailContext is context used to invoke mail related handlers
// This is defined so that handlers can be invoked on a set of
// mail credentials
type MailContext mail.MailCredentials

// NewMailContext returns a new mail context from the given information
func NewMailContext(user, password string) *MailContext {
	return &MailContext{
		User:     user,
		Password: password,
	}
}

// AsMailCredentials returns this mail context as mail credentials
// as a full copy
func (mc *MailContext) AsMailCredentials() *mail.MailCredentials {
	return &mail.MailCredentials{
		User:     mc.User,
		Password: mc.Password,
	}
}
