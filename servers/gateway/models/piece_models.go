package models

// NewPiece defines the information needed to create a new piece.
type NewPiece struct {
	Name   string `json:"name"`
	ShowID int    `json:"showID,omitempty"`
}

// Piece defines a piece within a show.
type Piece struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	ShowID    int    `json:"showID,omitempty"`
	IsDeleted bool   `json:"isDeleted"`
}
