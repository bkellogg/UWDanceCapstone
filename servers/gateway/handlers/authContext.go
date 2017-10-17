package handlers

import (
	"database/sql"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

// AuthContext defines a list of information that
// handlers performing authentication functions will
// need
type AuthContext struct {
	SessionKey    string
	SessionsStore sessions.Store
	DB            *sql.DB
}

// NewAuthContext Creates a new auth context with the given information
func NewAuthContext(sessionKey string, sessionStore sessions.Store, database *sql.DB) *AuthContext {
	return &AuthContext{
		SessionKey:    sessionKey,
		SessionsStore: sessionStore,
		DB:            database,
	}
}
