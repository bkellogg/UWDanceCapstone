package models

import (
	"errors"
	"fmt"
	"strings"
	"time"
)

// RehearsalTime defines how a rehearsal time
// for a piece is defined
type RehearsalTime struct {
	ID        int       `json:"id"`
	PieceID   int       `json:"pieceID"`
	Title     string    `json:"title"`
	Start     time.Time `json:"startTime"`
	End       time.Time `json:"endTime"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int64     `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}

// NewRehearsalTime defines the structure of a new
// rehearsal time sent to the server.
type NewRehearsalTime struct {
	PieceID int       `json:"pieceID"`
	Title   string    `json:"title"`
	Start   time.Time `json:"startTime"`
	End     time.Time `json:"endTime"`
}

// Validate validates the current new rehearsal time and
// normalizes values as applicable. Returns an error if
// one occurred.
func (nrt *NewRehearsalTime) Validate() error {
	if nrt.PieceID <= 0 {
		return errors.New("rehearsal time must be for a valid piece")
	}
	if nrt.Start.IsZero() {
		return errors.New("rehearsal time must have a valid start time")
	}
	if nrt.End.IsZero() {
		return errors.New("rehearsal time must have a valid end time")
	}
	if nrt.End.Before(nrt.Start) {
		return errors.New("rehearsal end time cannot be before rehearsal start time")
	}
	if len(nrt.Title) == 0 {
		nrt.Title = "Piece Rehearsal"
	} else {
		nrt.Title = strings.TrimSpace(strings.Title(nrt.Title))
	}
	return nil
}

// NewRehearsalTimes defines a slice of NewRehearsalTimes
type NewRehearsalTimes []*NewRehearsalTimes

// Validate validates the NewRehearsalTimes and returns
// an error if one occurred.
func (nrt NewRehearsalTimes) Validate() error {
	if len(nrt) == 0 {
		return nil
	}
	for _, rt := range nrt {
		if err := rt.Validate(); err != nil {
			return fmt.Errorf("invalid rehearsal time given: %v", err)
		}
	}
	return nil
}

// RehearsalTimes defines a slice of rehearsal times
type RehearsalTimes []*RehearsalTime
