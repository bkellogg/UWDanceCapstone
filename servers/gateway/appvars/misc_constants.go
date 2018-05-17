package appvars

import "time"

var StageURL string

const (
	AcceptCastTime = time.Hour * 24 * 2

	CastStatusPending  = "pending"
	CastStatusDeclined = "declined"
	CastStatusAccepted = "accepted"
	CastStatusExpired  = "expired"
)
