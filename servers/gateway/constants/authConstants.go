package constants

import (
	"time"
)

// Defines general constants for operations related to authentication
const (
	DefaultSessionDuration        = time.Hour
	PasswordResetValidityDuration = time.Minute * 5
	BCryptDefaultCost             = 13
)
