package sessions

import (
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"time"
)

// SessionState is a struct representing an authenticated session
type SessionState struct {
	User    *models.User
	BeganAt time.Time
}

// NewSessionState creates a new SessionState with the given user
func NewSessionState(user *models.User) *SessionState {
	return &SessionState{
		User:    user,
		BeganAt: time.Now(),
	}
}
