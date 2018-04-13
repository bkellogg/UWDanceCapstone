package models

import (
	"database/sql"
	"fmt"
	"net/http"
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

	users, dberr := handleUsersFromDatabase(rows, err)
	if dberr != nil {
		return nil, dberr
	}
	return users[0], nil
}

// txGetUser gets the given userID with the given transaction
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
		&aud.ID, &aud.ShowID,
		&aud.Time, &aud.Location,
		&aud.CreatedAt, &aud.CreatedBy,
		&aud.IsDeleted); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into audition: %v", err), http.StatusInternalServerError)
	}
	return aud, nil
}

// txGetUserAudition gets the UserAudition link between the given userID and
// the given audition ID using the given transaction if it exists.
// Returns an error if one occurred.
func txGetUserAudition(tx *sql.Tx, userID, audID int) (*UserAudition, *DBError) {
	res := tx.QueryRow(`SELECT * FROM UserAudition UA WHERE UA.UserID = ? AND UA.AuditionID = ?`, userID, audID)
	ua := &UserAudition{}
	err := res.Scan(
		&ua.ID, &ua.AuditionID,
		&ua.UserID, &ua.AvailabilityID,
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
