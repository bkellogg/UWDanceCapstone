package models

import "time"

// NewPiece defines the information needed to create a new piece.
type NewPiece struct {
	Name      string `json:"name"`
	ShowID    int    `json:"showID,omitempty"`
	CreatedBy int    `json:"-"`
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
