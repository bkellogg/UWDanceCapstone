package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"
)

// InsertNewAudition inserts a new audition and returns its id.
func (store *Database) InsertNewAudition(newAud *NewAudition) (*Audition, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginnign tranasction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	result, err := tx.Exec(`INSERT INTO Auditions (Time, Location, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
		newAud.Time, newAud.Location, newAud.CreatedAt, newAud.CreatedBy, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting audition: %v", err), http.StatusInternalServerError)
	}
	audID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	audition := &Audition{
		ID:        int(audID),
		Time:      newAud.Time,
		Location:  newAud.Location,
		CreatedAt: newAud.CreatedAt,
		CreatedBy: newAud.CreatedBy,
		IsDeleted: false,
	}
	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error commiting transaction: %v", err), http.StatusInternalServerError)
	}
	return audition, nil
}

// UpdateAuditionByID updates the given audition to have the new values
// in the updates parameter. If any value is unset, the value that is
// currently in the database will be used.
func (store *Database) UpdateAuditionByID(id int, updates *AuditionUpdate) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	// store a new variable for this
	// so we don't modify the updates
	// that were passed to us
	timeToUse := &updates.Time
	if updates.Time.IsZero() {
		timeToUse = nil
	}

	res, err := tx.Exec(
		`UPDATE Auditions A SET
		A.Time = COALESCE(NULLIF(?, ''), Time),
		A.Location = COALESCE(NULLIF(?, ''), Location)
		WHERE A.AuditionID = ? AND A.IsDeleted = FALSE`,
		timeToUse, updates.Location, id)
	if err != nil {
		return NewDBError(fmt.Sprintf("error applying audition updates: %v", err), http.StatusInternalServerError)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving rows affected: %v", err), http.StatusInternalServerError)
	}
	if rowsAffected == 0 {
		return NewDBError("no audition found", http.StatusNotFound)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// GetAuditionByID returns the audition with the given ID.
func (store *Database) GetAuditionByID(id int, includeDeleted bool) (*Audition, *DBError) {
	query := `SELECT * FROM Auditions A WHERE A.AuditionID = ?`
	if !includeDeleted {
		query += ` AND A.IsDeleted = false`
	}
	audition := &Audition{}
	err := store.db.QueryRow(query,
		id).Scan(
		&audition.ID, &audition.Time,
		&audition.Location, &audition.CreatedAt,
		&audition.CreatedBy, &audition.IsDeleted)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no audition found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving audition: %v", err), http.StatusInternalServerError)
	}
	return audition, nil
}

// InsertUserAuditionComment inserts the given comment to the given user's given audition.
// Returns a populated UserAuditionComment, or an error if one occurred.
func (store *Database) InsertUserAuditionComment(userID, audID, creatorID int, comment string) (*UserAuditionComment, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginnign tranasction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	rows, err := tx.Query(`SELECT UserAuditionID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.UserID = ? AND UA.IsDeleted = FALSE`, audID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("given user is not in given audition", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving UserAudition link: %v", err), http.StatusInternalServerError)
	}
	if !rows.Next() {
		return nil, NewDBError(fmt.Sprintf("error retrieving UserAudition link: %v", err), http.StatusInternalServerError)
	}

	userAudID := 0
	if err = rows.Scan(&userAudID); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into user audition: %v", err), http.StatusInternalServerError)
	}
	rows.Close()

	addTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO UserAuditionComment (UserAuditionID, Comment, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`,
		userAudID, comment, addTime, creatorID, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting user audition comment: %v", err), http.StatusInternalServerError)
	}
	commentID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return &UserAuditionComment{
		ID:             int(commentID),
		UserAuditionID: userAudID,
		Comment:        comment,
		CreatedAt:      addTime,
		CreatedBy:      creatorID,
		IsDeleted:      false,
	}, nil
}

// GetUserAuditionComments returns a slice of UserAuditionComments that match the given filters, or an
// error if one occurred.
func (store *Database) GetUserAuditionComments(userID, audID, creatorID, page int, includeDeleted bool) ([]*UserAuditionComment, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginnign tranasction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	rows, err := tx.Query(`SELECT UserAuditionID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.UserID = ? AND UA.IsDeleted = FALSE`, audID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no user audition found", http.StatusBadRequest)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving user audition: %v", err), http.StatusInternalServerError)
	}
	userAudID := 0
	if rows.Next() {
		if err = rows.Scan(&userAudID); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into user audition: %v", err), http.StatusInternalServerError)
		}
	} else {
		return nil, NewDBError("no user audition found", http.StatusBadRequest)
	}
	offset := getSQLPageOffset(page)
	query := `SELECT UAC.CommentID, UAC.UserAuditionID, UAC.Comment, UAC.CreatedAt, UAC.CreatedBy, UAC.IsDeleted
		FROM UserAuditionComment UAC JOIN UserAudition UA ON UAC.UserAuditionID = UA.UserAuditionID
		WHERE UAC.UserAuditionID = ? AND UA.IsDeleted = FALSE`
	if creatorID > 0 {
		query += ` AND UAC.CreatedBy = ` + strconv.Itoa(creatorID)
	}
	if !includeDeleted {
		query += ` AND UAC.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return parseUACommentsFromDatabase(store.db.Query(query, userAudID, offset))
}

// DeleteAuditionByID marks the audition with the given ID as deleted.
func (store *Database) DeleteAuditionByID(id int) error {
	_, err := store.db.Exec(`UPDATE Auditions SET IsDeleted = ? WHERE AuditionID = ?`, true, id)
	return err
}
