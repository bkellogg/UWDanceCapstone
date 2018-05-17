package models

import (
	"errors"
	"time"
)

// NewPiece defines the information needed to create a new piece.
type NewPiece struct {
	Name            string `json:"name"`
	ChoreographerID int    `json:"choreographerID"`
	ShowID          int    `json:"showID,omitempty"`
	CreatedBy       int    `json:"-"` // this will never be supplied by user, but will be populated by the handler
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
	ID              int       `json:"id"`
	ChoreographerID int       `json:"choreographerID,omitempty"`
	Name            string    `json:"name"`
	ShowID          int       `json:"showID,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
	CreatedBy       int       `json:"createdBy"`
	IsDeleted       bool      `json:"isDeleted"`
}

// PieceUsersResponse represents how the server will
// report all users in a piece.
type PieceUsersResponse struct {
	Page          int             `json:"page"`
	Choreographer *UserResponse   `json:"choreographer"`
	Dancers       []*UserResponse `json:"dancers"`
}

// NewPieceUsersResponse returns a new pointer to a PieceUsersResponse from the
// given information.
func NewPieceUsersResponse(page int, chor *UserResponse, dancers []*UserResponse) *PieceUsersResponse {
	return &PieceUsersResponse{Page: page, Choreographer: chor, Dancers: dancers}
}
