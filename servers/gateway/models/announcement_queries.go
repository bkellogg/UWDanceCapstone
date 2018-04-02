package models

import (
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"time"
)

// InsertAnnouncement inserts the given new announcement into the database
// and returns an announcement. Returns an error if one occurred.
func (store *Database) InsertAnnouncement(newAnnouncement *NewAnnouncement) (*Announcement, error) {
	at, err := store.getAnnouncementTypeByName(newAnnouncement.AnnouncementType, false)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("no AnnouncementType was found with the name '%s", newAnnouncement.AnnouncementType)
		}
		return nil, errors.New("error looking up announcement type: " + err.Error())
	}
	postTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO Announcements (AnnouncementTypeID, Message, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`, at.ID, newAnnouncement.Message, postTime, newAnnouncement.UserID, false)
	if err != nil {
		return nil, err
	}
	announcementID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return &Announcement{
		ID:                 announcementID,
		AnnouncementTypeID: at.ID,
		Message:            newAnnouncement.Message,
		CreatedAt:          postTime,
		CreatedBy:          newAnnouncement.UserID,
	}, nil
}

// getAnnouncementTypeByName returns the announcementType that has that name or an error if one occurred.
func (store *Database) getAnnouncementTypeByName(name string, includeDeleted bool) (*AnnouncementType, error) {
	query := `SELECT * FROM AnnouncementType AT WHERE AT.AnnouncementTypeName = ?`
	if !includeDeleted {
		query += ` AND AT.IsDeleted = false`
	}
	row := store.db.QueryRow(query, name)
	at := &AnnouncementType{}
	if err := row.Scan(&at.ID, &at.Name, &at.Desc, &at.CreatedAt, &at.CreatedBy, &at.IsDeleted); err != nil {
		return nil, err
	}
	return at, nil
}

// InsertAnnouncementType inserts the given AnnouncementType into the database.
// Returns an error if one occurred.
func (store *Database) InsertAnnouncementType(at *AnnouncementType) error {
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
	defer result.Close()
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

// GetAllAnnouncements gets the given page of announcements, optionally including deleted ones.
// returns an error if one occurred.
func (store *Database) GetAllAnnouncements(page int, includeDeleted bool, userID, typeName string) ([]*AnnouncementResponse, error) {
	var at *AnnouncementType
	var err error
	if len(typeName) > 0 {
		at, err = store.getAnnouncementTypeByName(typeName, includeDeleted)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, fmt.Errorf("no announcement type found with name '%s'", typeName)
			}
			return nil, errors.New("error looking up announcement type: " + err.Error())
		}
	}
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT A.AnnouncementID, A.AnnouncementTypeID, A.Message, A.CreatedAt, A.IsDeleted,
		U.UserID, U.FirstName, U.LastName, U.Email, U.RoleID, U.Active FROM Announcements A
		JOIN Users U ON A.CreatedBy = U.UserID`
	if !includeDeleted {
		query += ` WHERE A.IsDeleted = FALSE`
	}
	if len(userID) > 0 {
		query += ` AND A.CreatedBy = ` + userID
	}
	if at != nil {
		query += ` AND A.AnnouncementTypeID = ` + strconv.Itoa(int(at.ID))
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
	defer result.Close()
	announcements := make([]*AnnouncementResponse, 0)
	for result.Next() {
		a := &AnnouncementResponse{
			CreatedBy: &User{},
		}
		if err = result.Scan(&a.ID, &a.AnnouncementTypeID, &a.Message, &a.CreatedAt, &a.IsDeleted,
			&a.CreatedBy.ID, &a.CreatedBy.FirstName, &a.CreatedBy.LastName, &a.CreatedBy.Email,
			&a.CreatedBy.RoleID, &a.CreatedBy.Active); err != nil {
			return nil, err
		}
		announcements = append(announcements, a)
	}
	return announcements, nil
}
