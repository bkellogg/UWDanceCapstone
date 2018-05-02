package appvars

import "time"

const (
	StageURL = "https://dasc.capstone.ischool.uw.edu/"

	AcceptCastTime = time.Hour * 24 * 2

	CastStatusPending  = "pending"
	CastStatusDeclined = "declined"
	CastStatusAccepted = "accepted"
)
