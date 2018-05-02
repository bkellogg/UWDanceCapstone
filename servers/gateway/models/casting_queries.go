package models

import (
	"fmt"
	"net/http"
	"time"
)

// InsertNewUserPiecePending inserts a new entry representing a pending acceptance
func (store *Database) InsertNewUserPiecePending(userID, pieceID int, expiry time.Time) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	rows, err := tx.Query(`SELECT * FROM Users U WHERE U.UserID = ? AND U.Active = TRUE`, userID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error querying for user: %v", err), http.StatusInternalServerError)
	}
	if !rows.Next() {
		return NewDBError("no user found", http.StatusNotFound)
	}
	rows.Close()

	rows, err = tx.Query(`SELECT * FROM Pieces P WHERE P.PieceID = ? AND P.IsDeleted = FALSE`, userID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error querying for piece: %v", err), http.StatusInternalServerError)
	}
	if !rows.Next() {
		return NewDBError("no piece found", http.StatusNotFound)
	}
	rows.Close()

	_, err = tx.Exec(`INSERT INTO UserPiecePending (UserID, PieceID, ExpiresAt, Status, IsDeleted) VALUES (?, ?, ?, ?, ?)`)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting user piece pending: %v", err), http.StatusInternalServerError)
	}
	return nil
}
