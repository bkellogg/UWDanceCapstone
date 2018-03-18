package models

import (
	"database/sql"
	"time"
)

// InsertNewPiece inserts the given NewPiece into the database and returns the
// created Piece, or an error if one occurred.
func (store *Database) InsertNewPiece(newPiece *NewPiece) (*Piece, error) {
	createTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO Pieces (PieceName, ShowID, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
		newPiece.Name, newPiece.ShowID, createTime, newPiece.CreatedBy, false)
	if err != nil {
		return nil, err
	}
	pieceID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	piece := &Piece{
		ID:        int(pieceID),
		Name:      newPiece.Name,
		ShowID:    newPiece.ShowID,
		CreatedBy: newPiece.CreatedBy,
		CreatedAt: createTime,
	}
	return piece, nil
}

// GetPieceByID returns the show with the given ID.
func (store *Database) GetPieceByID(id int, includeDeleted bool) (*Piece, error) {
	piece := &Piece{}
	err := store.db.QueryRow(`SELECT * FROM Pieces P WHERE P.PieceID = ? AND P.IsDeleted = FALSE`, id).Scan(
		&piece.ID, &piece.Name,
		&piece.ShowID, &piece.CreatedAt,
		&piece.CreatedBy, &piece.IsDeleted)
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
	_, err := store.db.Exec(`UPDATE Pieces SET IsDeleted = ? WHERE PieceID = ?`, true, id)
	return err
}

// GetPiecesByUserID gets all pieces the given user is in.
func (store *Database) GetPiecesByUserID(id, page int, includeDeleted bool) ([]*Piece, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT P.PieceID, P.PieceName, P.ShowID, P.CreatedAt, P.CreatedBy,
	P.IsDeleted FROM Pieces P 
	JOIN UserPiece UP ON P.PieceID = UP.PieceID 
	WHERE UP.UserID = ?`
	if !includeDeleted {
		query += ` AND UP.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

// GetPiecesByShowID gets all pieces that are associated with the given show ID.
func (store *Database) GetPiecesByShowID(id, page int, includeDeleted bool) ([]*Piece, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT * FROM Pieces P Where P.ShowID = ?`
	if !includeDeleted {
		query += ` AND P.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

// GetPiecesByAuditionID gets all pieces in the given audition.
func (store *Database) GetPiecesByAuditionID(id, page int, includeDeleted bool) ([]*Piece, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT P.PieceID, P.PieceName, P.ShowID, P.CreatedAt, P.CreatedBy, P.IsDeleted FROM Pieces P
	JOIN Shows S ON P.ShowID = S.ShowID
	WHERE S.AuditionID = ?`
	if !includeDeleted {
		query += ` AND P.IsDeleted = FALSE AND S.IsDeleted = FALSE`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

//func (store *Database) AssignStaffToPiece(userID, pieceID int) error {
//	tx, err := store.db.Begin()
//	if err != nil {
//		return errors.New("error beginning db transaction: " + err.Error())
//	}
//	user := &User{}
//}

// handlePiecesFromDatabase compiles the given result and err into a slice of pieces or an error.
func handlePiecesFromDatabase(result *sql.Rows, err error) ([]*Piece, error) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	pieces := make([]*Piece, 0)
	for result.Next() {
		piece := &Piece{}
		if err = result.Scan(&piece.ID, &piece.Name, &piece.ShowID,
			&piece.CreatedAt, &piece.CreatedBy, &piece.IsDeleted); err != nil {
			return nil, err
		}
		pieces = append(pieces, piece)
	}
	return pieces, nil
}
