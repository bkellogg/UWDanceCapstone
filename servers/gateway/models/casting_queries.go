package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
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
	if !rows.Next() || err == sql.ErrNoRows {
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

	_, err = tx.Exec(`INSERT INTO UserPiecePending (UserID, PieceID, ExpiresAt, Status, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
		userID, pieceID, expiry, appvars.CastStatusPending, false)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting user piece pending: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// ExpirePendingUserPieces changes the status of any expired
// user piece addition to appvars.CastStatusExpired if the cast status
// is pending when this function is executed. This does not control the
// logic if a piece is expired or now. Returns the number of rows affected
// and an error if one occurred.
func (store *Database) ExpirePendingUserPieces() (int64, *DBError) {
	res, err := store.db.Exec(
		`UPDATE UserPiecePending SET Status = ? WHERE IsDeleted = FALSE AND Status = ? AND ExpiresAt > NOW()`,
		appvars.CastStatusExpired, appvars.CastStatusPending)
	if err != nil {
		return 0, NewDBError(fmt.Sprintf("error marking pending user pieces as expired: %v", err), http.StatusInternalServerError)
	}
	numRows, err := res.RowsAffected()
	if err != nil {
		return 0, NewDBError(fmt.Sprintf("error retrieving rows affected: %v", err), http.StatusInternalServerError)
	}
	return numRows, nil
}

// GetUserPiecePending returns a slice of pieces that the given user
// has pending invites for.
func (store *Database) GetUserPiecePending(id int) ([]*Piece, *DBError) {
	rows, err := store.db.Query(`
		SELECT P.PieceID, P.ChoreographerID, P.PieceName, P.ShowID, P.CreatedAt, P.CreatedBy, P.IsDeleted FROM Pieces P
		JOIN UserPiecePending UPP ON UPP.PieceID = P.PieceID
		WHERE UPP.UserID = ?
		AND P.IsDeleted = FALSE
		AND UPP.IsDeleted = FALSE
		AND UPP.ExpiresAt > NOW()
		AND UPP.Status = ?`,
		id, appvars.CastStatusPending)
	return handlePiecesFromDatabase(rows, err)
}
