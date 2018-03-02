package models

import (
	"database/sql"
	"errors"
	"strconv"
	"time"
)

// InsertAnnouncement inserts the given new announcement into the database
// and returns an announcement. Returns an error if one occurred.
func (store *Database) InsertAnnouncement(newAnnouncement *NewAnnouncement) (*Announcement, error) {
	postTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO Announcements (Message, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?)`, newAnnouncement.Message, postTime, newAnnouncement.UserID, false)
	if err != nil {
		return nil, err
	}
	announcementID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return &Announcement{
		ID:        announcementID,
		Message:   newAnnouncement.Message,
		CreatedAt: postTime,
		CreatedBy: newAnnouncement.UserID,
	}, nil
}

// InsertAnnouncementType inserts the given AnnouncementType into the database.
// Returns an error if one occurred.
func (store *Database) InsertAnnouncementType(at *AnnouncementType) error {
	if err := at.Validate(); err != nil {
		return errors.New("announcement type validation failed: " + err.Error())
	}
	result, err := store.db.Exec(`INSERT INTO AnnouncementType (AnnouncementTypeName, AnnouncementTypeDesc,
		CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`, at.Name, at.Desc, at.CreatedAt, at.CreatedBy, at.IsDeleted)
	if err != nil {
		return errors.New("announcement type insert failed: " + err.Error())
	}
	atID, err := result.LastInsertId()
	if err != nil {
		return errors.New("failed to get ID of announcement type: " + err.Error())
	}
	at.ID = atID
	return nil
}

// GetAnnouncementTypes returns a slice of AnnouncementTypes based on the filters provided.
// Returns an error if one occurred.
func (store *Database) GetAnnouncementTypes(includeDeleted bool) ([]*AnnouncementType, error) {
	query := `SELECT * FROM AnnouncementType AT`
	if !includeDeleted {
		query += ` WHERE AT.IsDeleted = false`
	}
	result, err := store.db.Query(query)
	if err != nil {
		return nil, errors.New("error getting announcement types: " + err.Error())
	}
	announcementTypes := make([]*AnnouncementType, 0)
	for result.Next() {
		at := &AnnouncementType{}
		if err := result.Scan(&at.ID, &at.Name, &at.Desc, &at.CreatedAt, &at.CreatedBy, &at.IsDeleted); err != nil {
			return nil, err
		}
		announcementTypes = append(announcementTypes, at)
	}
	return announcementTypes, nil
}

// GetAllAnnouncements gets the given page of annoucements, optionally including deleted ones.
// returns an error if one occurred.
func (store *Database) GetAllAnnouncements(page int, includeDeleted bool, userID int) ([]*AnnouncementResponse, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT A.AnnouncementID, A.Message, A.CreatedAt, A.IsDeleted,
		U.UserID, U.FirstName, U.LastName, U.Email, U.Role, U.Active FROM Announcements A
		JOIN Users U ON A.CreatedBy = U.UserID`
	if !includeDeleted {
		query += ` WHERE A.IsDeleted = FALSE`
	}
	if userID > 0 {
		query += ` AND A.CreatedBy = ` + strconv.Itoa(userID)
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleAnnouncementsFromDatabase(store.db.Query(query, offset))
}

// handleAnnouncementsFromDatabase compiles the given result and err into a slice of AnnouncementResponse or an error.
func handleAnnouncementsFromDatabase(result *sql.Rows, err error) ([]*AnnouncementResponse, error) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	announcements := make([]*AnnouncementResponse, 0)
	for result.Next() {
		a := &AnnouncementResponse{
			CreatedBy: &User{},
		}
		if err = result.Scan(&a.ID, &a.Message, &a.CreatedAt, &a.IsDeleted,
			&a.CreatedBy.ID, &a.CreatedBy.FirstName, &a.CreatedBy.LastName, &a.CreatedBy.Email,
			&a.CreatedBy.Role, &a.CreatedBy.Active); err != nil {
			return nil, err
		}
		announcements = append(announcements, a)
	}
	return announcements, nil
}
