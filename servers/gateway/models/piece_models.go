package models

import (
	"errors"
	"time"
)

// NewPiece defines the information needed to create a new piece.
type NewPiece struct {
	Name      string `json:"name"`
	ShowID    int    `json:"showID,omitempty"`
	CreatedBy int    `json:"-"` // this will never be supplied by user, but will be populated by the handler
}

// Validate validates the new piece and returns an error if one occurred.
func (np *NewPiece) Validate() error {
	if len(np.Name) == 0 {
		return errors.New("new piece must have a name")
	}
	return nil
}

// Piece defines a piece within a show.
type Piece struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	ShowID    int       `json:"showID,omitempty"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}
