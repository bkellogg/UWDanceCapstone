package appvars

import (
	"time"
)

// Defines general appvars for operations related to authentication
const (
	DefaultSessionDuration = time.Hour
	BCryptDefaultCost      = 13

	PasswordResetTokenLength      = 30
	PasswordResetValidityDuration = time.Minute * 5
	PasswordMinLength             = 6
)
