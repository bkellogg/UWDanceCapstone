package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// InsertNewUserPieceInvite inserts a new entry representing a pending acceptance
func (store *Database) InsertNewUserPieceInvite(userID, pieceID int, expiry time.Time) *DBError {
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

	rows, err = tx.Query(`SELECT * FROM Pieces P WHERE P.PieceID = ? AND P.IsDeleted = FALSE`, pieceID)
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

// ExpirePendingPieceInvites changes the status of any expired
// user piece addition to appvars.CastStatusExpired if the cast status
// is pending when this function is executed. This does not control the
// logic if a piece is expired or now. Returns the number of rows affected
// and an error if one occurred.
func (store *Database) ExpirePendingPieceInvites() (int64, *DBError) {
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

// GetUserPieceInvites returns a slice of pieces that the given user
// has pending invites for.
func (store *Database) GetUserPieceInvites(id int) ([]*Piece, *DBError) {
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

// UserHasInviteForPiece returns if the user has an invite for the given piece.
// Returns an error if one occurred.
func (store *Database) UserHasInviteForPiece(userID, pieceID int64) (bool, *DBError) {
	rows, err := store.db.Query(`SELECT UPP.UserPiecePendingID FROM UserPiecePending UPP
		WHERE UPP.UserID = ?
		AND UPP.PieceID = ?
		AND UPP.Status = ?
		AND UPP.ExpiresAt > NOW()`, userID, pieceID, appvars.CastStatusPending)
	if err != nil {
		return false, NewDBError(fmt.Sprintf("error getting invite for user/piece: %v", err), http.StatusInternalServerError)
	}
	return rows.Next(), nil
}

// MakInvite marks the given invite between the user and piece as accepted or
// declined depending on the given accepted param
func (store *Database) MarkInvite(userID, pieceID int, status string) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	switch status {
	case appvars.CastStatusDeclined,
		appvars.CastStatusAccepted,
		appvars.CastStatusExpired:
	default:
		return NewDBError("invalid cast status", http.StatusBadRequest)
	}

	dberr := txMarkInvite(tx, userID, pieceID, status)
	if dberr != nil {
		return dberr
	}

	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}
