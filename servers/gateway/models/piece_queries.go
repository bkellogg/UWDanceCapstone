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
	result, err := tx.Exec(`INSERT INTO Pieces (PieceName, ShowID, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
		newPiece.Name, newPiece.ShowID, createTime, newPiece.CreatedBy, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting piece: %v", err), http.StatusInternalServerError)
	}
	pieceID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	piece := &Piece{
		ID:        int(pieceID),
		Name:      newPiece.Name,
		ShowID:    newPiece.ShowID,
		CreatedBy: newPiece.CreatedBy,
		CreatedAt: createTime,
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
		&piece.ID, &piece.Name,
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

// DeletePieceByID marks the piece with the given ID as deleted.
func (store *Database) DeletePieceByID(id int) error {
	_, err := store.db.Exec(`UPDATE Pieces SET IsDeleted = ? WHERE PieceID = ?`, true, id)
	return err
}

// GetPiecesByUserID gets all pieces the given user is in.
func (store *Database) GetPiecesByUserID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
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
func (store *Database) GetPiecesByShowID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT * FROM Pieces P Where P.ShowID = ?`
	if !includeDeleted {
		query += ` AND P.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

// GetPiecesByAuditionID gets all pieces in the given audition.
func (store *Database) GetPiecesByAuditionID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
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
		if err = result.Scan(&piece.ID, &piece.Name, &piece.ShowID,
			&piece.CreatedAt, &piece.CreatedBy, &piece.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into pieces: %v", err), http.StatusInternalServerError)
		}
		pieces = append(pieces, piece)
	}
	return pieces, nil
}
