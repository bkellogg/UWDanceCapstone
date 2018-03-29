package models

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// InsertNewAudition inserts a new audition and returns its id.
func (store *Database) InsertNewAudition(newAud *NewAudition) (*Audition, error) {
	result, err := store.db.Exec(`INSERT INTO Auditions (Name, Time, Location, Quarter, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		newAud.Name, newAud.Time, newAud.Location, newAud.Quarter, newAud.CreatedAt, newAud.CreatedBy, false)
	if err != nil {
		return nil, err
	}
	audID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	audition := &Audition{
		ID:        int(audID),
		Name:      newAud.Name,
		Time:      newAud.Time,
		Location:  newAud.Location,
		Quarter:   newAud.Quarter,
		CreatedAt: newAud.CreatedAt,
		CreatedBy: newAud.CreatedBy,
		IsDeleted: false,
	}
	return audition, nil
}

// GetAuditionByName returns the audition with the given name.
func (store *Database) GetAuditionByName(name string, includeDeleted bool) (*Audition, error) {
	query := `SELECT * FROM Auditions A WHERE A.Name = ?`
	if !includeDeleted {
		query += ` AND A.IsDeleted = false`
	}
	audition := &Audition{}
	err := store.db.QueryRow(query,
		name).Scan(
		&audition.ID, &audition.Name, &audition.Time,
		&audition.Location, &audition.Quarter, &audition.CreatedAt,
		&audition.CreatedBy, &audition.IsDeleted)
	if err != nil {
		audition = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return audition, err
}

// GetAuditionByID returns the audition with the given ID.
func (store *Database) GetAuditionByID(id int, includeDeleted bool) (*Audition, error) {
	query := `SELECT * FROM Auditions A WHERE A.AuditionID = ?`
	if !includeDeleted {
		query += ` AND A.IsDeleted = false`
	}
	audition := &Audition{}
	err := store.db.QueryRow(query,
		id).Scan(
		&audition.ID, &audition.Name, &audition.Time,
		&audition.Location, &audition.Quarter, &audition.CreatedAt,
		&audition.CreatedBy, &audition.IsDeleted)
	if err != nil {
		audition = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return audition, err
}

// InsertUserAuditionComment inserts the given comment to the given user's given audition.
// Returns a populated UserAuditionComment, or an error if one occurred.
func (store *Database) InsertUserAuditionComment(userID, audID, creatorID int, comment string) (*UserAuditionComment, error) {
	rows, err := store.db.Query(`SELECT UserAuditionID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.UserID = ? AND UA.IsDeleted = FALSE`, audID, userID)
	if err != nil {
		return nil, err
	}
	userAudID := 0
	if rows.Next() {
		if err = rows.Scan(&userAudID); err != nil {
			return nil, err
		}
	} else {
		return nil, sql.ErrNoRows
	}
	addTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO UserAuditionComment (UserAuditionID, Comment, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`,
		userAudID, comment, addTime, creatorID, false)
	if err != nil {
		return nil, err
	}
	commentID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	rows.Close()
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
func (store *Database) GetUserAuditionComments(userID, audID, creatorID, page int, includeDeleted bool) ([]*UserAuditionComment, error) {
	rows, err := store.db.Query(`SELECT UserAuditionID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.UserID = ? AND UA.IsDeleted = FALSE`, audID, userID)
	if err != nil {
		return nil, err
	}
	userAudID := 0
	if rows.Next() {
		if err = rows.Scan(&userAudID); err != nil {
			return nil, err
		}
	} else {
		return nil, errors.New(appvars.ErrUserAuditionDoesNotExist)
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
