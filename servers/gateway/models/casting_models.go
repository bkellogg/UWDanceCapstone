package models

import (
	"time"

	"github.com/pkg/errors"
)

// CastingConfVars defines the variables that will be merged
// into the casting confirmation template.
type CastingConfVars struct {
	Name       string
	ChorFName  string
	ChorLName  string
	ExpiryTime string
	URL        string
}

// CastingConfResult defines how a single user cast result
// will be sent to the client. Since there a lot of ways for the
// cast to fail, we will include the message and if the user failed
// to have an invite created for them and have an email sent, etc.
type CastingConfResult struct {
	Dancer        *User  `json:"dancer"`
	InviteCreated bool   `json:"inviteCreated"`
	EmailSent     bool   `json:"emailSent"`
	IsError       bool   `json:"isError"`
	Message       string `json:"message,omitempty"`
}

// PostCastingRequest defines how the body of a request
// to post casting is formatted.
type PostCastingRequest struct {
	Rehearsals        NewRehearsalTimes `json:"rehearsals,omitempty"`
	RehearsalSchedule string            `json:"rehearsalSchedule,omitempty"`
}

// Validate validates the given PostCastingRequest.
// Returns an error if one occurred.
func (pcr *PostCastingRequest) Validate() error {
	if err := pcr.Rehearsals.Validate(); err != nil {
		return err
	}
	if len(pcr.RehearsalSchedule) > 500 {
		return errors.New("rehearsal schedule must be fewer than 500 characters")
	}
	return nil
}

// PostCastingResponse defines the structure of a post
// casting request response
type PostCastingResponse struct {
	Message           string               `json:"message,omitempty"`
	Rehearsals        RehearsalTimes       `json:"rehearsals,omitempty"`
	RehearsalSchedule string               `json:"rehearsalSchedule,omitempty"`
	CastingResults    []*CastingConfResult `json:"castingResults"`
}

// PieceInviteResponse defines how an invite for a given piece is
// reported to the client.
type PieceInviteResponse struct {
	Choreographer     *UserResponse `json:"choreographer"`
	Piece             *Piece        `json:"piece"`
	RehearsalSchedule string        `json:"rehearsalSchedule"`
	ExpiryTime        time.Time     `json:"expiresAt"`
}
