package handlers

import (
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
