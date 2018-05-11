package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"
)

// InsertNewPiece inserts the given NewPiece into the database and returns the
// created Piece, or an error if one occurred.
func (store *Database) InsertNewPiece(newPiece *NewPiece) (*Piece, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query(`SELECT * FROM Shows S WHERE S.ShowID = ?`, newPiece.ShowID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError(fmt.Sprintf("no show found with id %v", newPiece.ShowID), http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving show from database: %v", err), http.StatusInternalServerError)
	}
	if !res.Next() {
		return nil, NewDBError(fmt.Sprintf("no show found with id %v", newPiece.ShowID), http.StatusNotFound)
	}
	res.Close()

	createTime := time.Now()
	result, err := tx.Exec(`INSERT INTO Pieces (PieceName, ChoreographerID, ShowID, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		newPiece.Name, newPiece.ChoreographerID, newPiece.ShowID, createTime, newPiece.CreatedBy, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting piece: %v", err), http.StatusInternalServerError)
	}
	pieceID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	piece := &Piece{
		ID:              int(pieceID),
		ChoreographerID: newPiece.ChoreographerID,
		Name:            newPiece.Name,
		ShowID:          newPiece.ShowID,
		CreatedBy:       newPiece.CreatedBy,
		CreatedAt:       createTime,
	}
	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return piece, nil
}

// GetPieceByID returns the show with the given ID.
func (store *Database) GetPieceByID(id int, includeDeleted bool) (*Piece, *DBError) {
	piece := &Piece{}
	err := store.db.QueryRow(`SELECT * FROM Pieces P WHERE P.PieceID = ? AND P.IsDeleted = FALSE`, id).Scan(
		&piece.ID, &piece.ChoreographerID, &piece.Name,
		&piece.ShowID, &piece.CreatedAt,
		&piece.CreatedBy, &piece.IsDeleted)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no piece found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving piece: %v", err), http.StatusInternalServerError)
	}
	return piece, nil
}

// GetChoreographerShowPiece gets the current piece in the show that the given
// choreographer is running, if it exists. Returns an error if one occurred.
func (store *Database) GetChoreographerShowPiece(showID, choreographerID int) (*Piece, *DBError) {
	pArr, dberr := handlePiecesFromDatabase(store.db.Query(`SELECT * FROM Pieces P
		WHERE P.ChoreographerID = ?
		AND P.ShowID = ?
		AND P.IsDeleted = FALSE`, choreographerID, showID))
	if dberr != nil {
		return nil, dberr
	}
	if len(pArr) == 0 {
		return nil, NewDBError("no pieces found", http.StatusNotFound)
	}
	return pArr[0], nil
}

// AssignChoreographerToPiece assigns the given user id as a
// choreographer to the given piece. Assumes the user is a valid
// choreographer user. Returns an error if one occurred.
func (store *Database) AssignChoreographerToPiece(userID, pieceID int) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query(`SELECT * FROM Pieces P WHERE P.PieceID = ?`, pieceID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving piece from database: %v", err), http.StatusInternalServerError)
	}
	if !res.Next() {
		return NewDBError("no piece found with the given id", http.StatusNotFound)
	}
	res.Close()

	_, err = tx.Exec(`UPDATE Pieces SET Pieces.ChoreographerID = ? WHERE Pieces.PieceID = ?`, userID, pieceID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error adding choreographer to piece: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// DeletePieceByID marks the piece with the given ID as deleted.
func (store *Database) DeletePieceByID(id int) *DBError {
	_, err := store.db.Exec(`UPDATE Pieces SET IsDeleted = ? WHERE PieceID = ?`, true, id)
	return NewDBError(fmt.Sprintf("error deleting piece: %v", err), http.StatusInternalServerError)
}

// GetPiecesByUserID gets all pieces the given user is in.
func (store *Database) GetPiecesByUserID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT P.PieceID, P.ChoreographerID ,P.PieceName, P.ShowID, P.CreatedAt, P.CreatedBy,
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
func (store *Database) GetPiecesByShowID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT * FROM Pieces P Where P.ShowID = ?`
	if !includeDeleted {
		query += ` AND P.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

// handlePiecesFromDatabase compiles the given result and err into a slice of pieces or an error.
func handlePiecesFromDatabase(result *sql.Rows, err error) ([]*Piece, *DBError) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no pieces found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving pieces from database: %v", err), http.StatusInternalServerError)
	}
	pieces := make([]*Piece, 0)
	for result.Next() {
		piece := &Piece{}
		if err = result.Scan(&piece.ID, &piece.ChoreographerID, &piece.Name, &piece.ShowID,
			&piece.CreatedAt, &piece.CreatedBy, &piece.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into pieces: %v", err), http.StatusInternalServerError)
		}
		pieces = append(pieces, piece)
	}
	return pieces, nil
}
