package appvars

import "time"

var StageURL string

const (
	AcceptCastTime = time.Hour * 24 * 2

	PieceInviteJanitorRecheckDelay = time.Hour

	// time in which the casting session should reset
	// after not being used
	CastingSessionResetTime          = time.Hour
	CastingSessionExpireReCheckDelay = time.Minute * 15

	CastStatusPending  = "pending"
	CastStatusDeclined = "declined"
	CastStatusAccepted = "accepted"
	CastStatusExpired  = "expired"
	CastStatusDeleted  = "deleted"

	EmptyRehearsalSchedule = "Weekly rehearsals have not been set yet."
)
