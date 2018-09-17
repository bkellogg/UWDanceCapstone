package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"sort"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// txCleanup commits the given transaction if
// the error is nil, or rolls if back if
// the error is non-nil
func txCleanup(tx *sql.Tx, err *DBError) {
	if err != nil {
		tx.Rollback()
	} else {
		tx.Commit()
	}
}

// txGetUser gets the given userID with the given transaction
// returns an error if one occurred.
func txGetUser(tx *sql.Tx, userID int) (*User, *DBError) {
	rows, err := tx.Query(`SELECT * FROM Users U Where U.UserID = ?`, userID)
	if err != nil && err != sql.ErrNoRows {
		return nil, NewDBError(fmt.Sprintf("error querying user: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()

	users, dberr := handleUsersFromDatabase(rows, err)
	if dberr != nil {
		return nil, dberr
	}
	if len(users) == 0 {
		return nil, NewDBError("no user found", http.StatusNotFound)
	}
	return users[0], nil
}

// txGetAudition gets the given audition with the given transaction
// returns an error if one occurred.
func txGetAudition(tx *sql.Tx, audID int) (*Audition, *DBError) {
	rows, err := tx.Query(`SELECT * FROM Auditions A WHERE A.AuditionID = ?`, audID)
	if err != nil && err != sql.ErrNoRows {
		return nil, NewDBError(fmt.Sprintf("error querying audition: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, NewDBError("no audition found", http.StatusNotFound)
	}
	aud := &Audition{}
	if err = rows.Scan(
		&aud.ID,
		&aud.Time, &aud.Location,
		&aud.CreatedAt, &aud.CreatedBy,
		&aud.IsDeleted); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into audition: %v", err), http.StatusInternalServerError)
	}
	return aud, nil
}

// txGetPiece gets the given piece with the given transaction
// returns an error if one occurred.
func txGetPiece(tx *sql.Tx, pieceID int) (*Piece, *DBError) {
	rows, err := tx.Query(`SELECT * FROM Pieces P WHERE P.PieceID = ?`, pieceID)
	if err != nil && err != sql.ErrNoRows {
		return nil, NewDBError(fmt.Sprintf("error querying piece: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, NewDBError("no piece found", http.StatusNotFound)
	}
	piece := &Piece{}
	if err = rows.Scan(&piece.ID, &piece.InfoSheetID, &piece.ChoreographerID,
		&piece.Name, &piece.ShowID, &piece.CreatedAt,
		&piece.CreatedBy, &piece.IsDeleted); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into piece: %v", err), http.StatusInternalServerError)
	}
	return piece, nil
}

// txGetUserAudition gets the UserAudition link between the given userID and
// the given audition ID using the given transaction if it exists.
// Returns an error if one occurred.
func txGetUserAudition(tx *sql.Tx, userID, audID int) (*UserAudition, *DBError) {
	res := tx.QueryRow(`SELECT * FROM UserAudition UA WHERE UA.UserID = ? AND UA.AuditionID = ? AND UA.IsDeleted = false`, userID, audID)
	ua := &UserAudition{}
	err := res.Scan(
		&ua.ID, &ua.AuditionID,
		&ua.UserID, &ua.AvailabilityID,
		&ua.RegNum, &ua.NumShows,
		&ua.CreatedAt, &ua.CreatedBy,
		&ua.IsDeleted)
	if err != nil && err != sql.ErrNoRows {
		return nil, NewDBError(fmt.Sprintf("error retrieving user audition from database: %v", err), http.StatusInternalServerError)
	}
	if err == sql.ErrNoRows {
		return nil, NewDBError("no link between user and audition found", http.StatusNotFound)
	}
	return ua, nil
}

// txGetUserAuditionComments gets all the comments of the given user audition link
// and returns them. Returns an error if one occurred. Does not treat no comments as an error.
func txGetUserAuditionComments(tx *sql.Tx, userAudID int) ([]*UserAuditionComment, *DBError) {
	rows, err := tx.Query(`SELECT * FROM UserAuditionComment UAC WHERE UAC.UserAuditionID = ?`, userAudID)
	if err != nil && err != sql.ErrNoRows {
		return nil, NewDBError(fmt.Sprintf("error retrieving user audition comments from database: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	comments := make([]*UserAuditionComment, 0)
	for rows.Next() {
		comment := &UserAuditionComment{}
		if err = rows.Scan(
			&comment.ID, &comment.UserAuditionID,
			&comment.Comment, &comment.CreatedAt,
			&comment.CreatedBy, &comment.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into user auditon comment: %v", err), http.StatusInternalServerError)
		}
		comments = append(comments, comment)
	}
	return comments, nil
}

// txGetUserAuditionAvailability gets the availability with the given ID if it exists
// returns an error if one occurred.
func txGetUserAuditionAvailability(tx *sql.Tx, availID int) (*WeekTimeBlock, *DBError) {
	rawAvail := &RawAvailability{}
	rows, err := tx.Query(`SELECT * FROM UserAuditionAvailability UAA WHERE UAA.ID = ?`, availID)
	if err != nil && err != sql.ErrNoRows {
		return nil, NewDBError(fmt.Sprintf("error retrieving availability: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, NewDBError("no availability found", http.StatusNotFound)
	}
	if err = rows.Scan(
		&rawAvail.ID,
		&rawAvail.Sunday, &rawAvail.Monday, &rawAvail.Tuesday,
		&rawAvail.Wednesday, &rawAvail.Thursday, &rawAvail.Friday,
		&rawAvail.Saturday, &rawAvail.CreatedAt, &rawAvail.IsDeleted,
	); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into availability: %v", err), http.StatusInternalServerError)
	}
	wtb, err := rawAvail.toWeekTimeBlock()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error parsing availability into a week time block: %v", err), http.StatusInternalServerError)
	}
	return wtb, nil
}

// txGetShow gets the show with the given id using the given
// transaction. Returns an error if one occurred.
func txGetShow(tx *sql.Tx, showID int) (*Show, *DBError) {
	rows, err := tx.Query(`SELECT * FROM Shows S WHERE S.ShowID = ?`, showID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving show: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, NewDBError("no show found", http.StatusNotFound)
	}
	show := &Show{}
	if err = rows.Scan(
		&show.ID, &show.TypeID,
		&show.AuditionID, &show.EndDate,
		&show.CreatedAt, &show.CreatedBy,
		&show.IsDeleted); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into show: %v", err), http.StatusInternalServerError)
	}
	return show, nil
}

// txGetShow gets the show with the given id using the given
// transaction. Returns an error if one occurred.
func txGetShowByAuditionID(tx *sql.Tx, audID int) (*Show, *DBError) {
	rows, err := tx.Query(`SELECT * FROM Shows S WHERE S.AuditionID = ?`, audID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving show: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, NewDBError("no show found", http.StatusNotFound)
	}
	show := &Show{}
	if err = rows.Scan(
		&show.ID, &show.TypeID,
		&show.AuditionID, &show.EndDate,
		&show.CreatedAt, &show.CreatedBy,
		&show.IsDeleted); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into show: %v", err), http.StatusInternalServerError)
	}
	return show, nil
}

// txGetNextAuditionRegNumber returns the next reg number that a dancer
// should get when registering for an audition. Returns an error if one occurred.
func txGetNextAuditionRegNumber(tx *sql.Tx, audID int) (int, *DBError) {
	rows, err := tx.Query(`SELECT UA.RegNum FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.IsDeleted = FALSE`, audID)
	if err != nil {
		return -1, NewDBError(fmt.Sprintf("error querying existing reg numbers: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()

	regNums := make([]int, 0)
	for rows.Next() {
		var num int
		if err = rows.Scan(&num); err != nil {
			return -1, NewDBError(fmt.Sprintf("error scanning row into reg number: %v", err), http.StatusInternalServerError)
		}
		regNums = append(regNums, num)
	}

	// if the number of reg nums with the given conversation is 0,
	// return 1
	if len(regNums) == 0 {
		return 1, nil
	}

	// sort it to make it easier to look for a missing number
	sort.Ints(regNums)

	num := 1
	for i := 1; i <= len(regNums); i++ {
		// there are no missing numbers and we've reached the end
		// give it the next number
		if i == len(regNums) {
			return len(regNums) + 1, nil
		}

		// handle the case where the next number is one greater
		// than the last one
		if regNums[i]-num == 1 {
			num++
			continue // skip the rest of this cycle
		}

		if regNums[i]-num > 1 {
			num++
			break
		}
	}
	return num, nil
}

// txMarkInvite marks the invite between the given user and piece
// to the given status using the provided transaction
func txMarkInvite(tx *sql.Tx, userID, pieceID int, status string) *DBError {
	res, err := tx.Exec(`UPDATE UserPiecePending UPP SET UPP.Status = ?
		WHERE UPP.UserID = ?
		AND UPP.PieceID = ?
		AND UPP.IsDeleted = FALSE
		AND UPP.Status = ?`, status, userID, pieceID, appvars.CastStatusPending)
	if err != nil {
		return NewDBError(fmt.Sprintf("error updating user piece invite: %v", err), http.StatusInternalServerError)
	}
	numRows, err := res.RowsAffected()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving rows affected: %v", err), http.StatusInternalServerError)
	}
	if numRows == 0 {
		return NewDBError("invite between given user and given piece does not exist", http.StatusNotFound)
	}
	return nil
}
