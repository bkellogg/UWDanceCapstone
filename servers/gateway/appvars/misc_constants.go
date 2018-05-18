package appvars

import "time"

var StageURL string

const (
	AcceptCastTime = time.Hour * 24 * 2

	PieceInviteJanitorRecheckDelay = time.Hour

	// time in which the casting session should reset
	// after not being used
	CastingSessionResetTime          = time.Hour
	CastingSessionExpireReCheckDelay = time.Hour

	CastStatusPending  = "pending"
	CastStatusDeclined = "declined"
	CastStatusAccepted = "accepted"
	CastStatusExpired  = "expired"
)
