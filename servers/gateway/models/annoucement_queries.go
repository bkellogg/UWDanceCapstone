package models

import (
	"database/sql"
	"strconv"
	"time"
)

// InsertNewAnnouncment inserts the given new annoucement into the database
// and returns an annoucement. Returns an error if one occured.
func (store *Database) InsertNewAnnouncment(newAnnouncement *NewAnnouncement) (*Announcement, error) {
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
