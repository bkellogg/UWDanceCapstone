package models

import "database/sql"

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

// InsertNewPiece inserts the given NewPieve into the database and returns the
// created Piece, or an error if one occured.
func (store *Database) InsertNewPiece(newPiece *NewPiece) (*Piece, error) {
	result, err := store.DB.Exec(`INSERT INTO Pieces (PieceName, ShowID, IsDeleted) VALUES (?, ?, ?)`,
		newPiece.Name, newPiece.ShowID, false)
	if err != nil {
		return nil, err
	}
	pieceID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	piece := &Piece{
		ID:     int(pieceID),
		Name:   newPiece.Name,
		ShowID: newPiece.ShowID,
	}
	return piece, nil
}

// GetPieceByID returns the show with the given ID.
func (store *Database) GetPieceByID(id int) (*Piece, error) {
	piece := &Piece{}
	err := store.DB.QueryRow(`SELECT * FROM Pieces P WHERE P.PieceID = ?`, id).Scan(
		&piece.ID, &piece.Name,
		&piece.ShowID, &piece.IsDeleted)
	if err != nil {
		piece = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return piece, err
}

// DeletePieceByID marks the piece with the given ID as deleted.
func (store *Database) DeletePieceByID(id int) error {
	_, err := store.DB.Exec(`UPDATE Pieces SET IsDeleted = ? WHERE PieceID = ?`, true, id)
	return err
}

// GetPiecesByShowID gets all pieces that are associated with the given show ID.
func (store *Database) GetPiecesByShowID(id int) ([]*Piece, error) {
	result, err := store.DB.Query(`SELECT * FROM Pieces P Where P.ShowID = ?`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	pieces := make([]*Piece, 0)
	for result.Next() {
		piece := &Piece{}
		if err = result.Scan(&piece.ID, &piece.Name, &piece.ShowID, &piece.IsDeleted); err != nil {
			return nil, err
		}
		pieces = append(pieces, piece)
	}
	return pieces, nil
}
