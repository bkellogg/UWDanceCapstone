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
	result, err := store.DB.Exec(`INSERT INTO Announcements (PostDate, User, Message, IsDeleted)
		VALUES (?, ?, ?, ?)`, postTime, newAnnouncement.UserID, newAnnouncement.Message, false)
	if err != nil {
		return nil, err
	}
	announcementID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return &Announcement{
		ID:       announcementID,
		PostDate: postTime,
		UserID:   newAnnouncement.UserID,
		Message:  newAnnouncement.Message,
	}, nil
}

// GetAllAnnouncements gets the given page of annoucements, optionally including deleted ones.
// returns an error if one occurred.
func (store *Database) GetAllAnnouncements(page int, includeDeleted bool, userID int) ([]*AnnouncementResponse, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT A.AnnouncementID, A.PostDate, A.Message, A.IsDeleted,
		U.UserID, U.FirstName, U.LastName, U.Email, U.PassHash, U.Role, U.Active FROM Announcements A
		JOIN Users U ON A.User = U.UserID`
	if !includeDeleted {
		query += ` WHERE A.IsDeleted = FALSE`
	}
	if userID > 0 {
		query += ` AND A.User = ` + strconv.Itoa(userID)
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleAnnouncementsFromDatabase(store.DB.Query(query, offset))
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
			User: &User{},
		}
		if err = result.Scan(&a.ID, &a.PostDate, &a.Message, &a.IsDeleted, &a.User.ID,
			&a.User.FirstName, &a.User.LastName, &a.User.Email, &a.User.PassHash, &a.User.Role, &a.User.Active); err != nil {
			return nil, err
		}
		announcements = append(announcements, a)
	}
	return announcements, nil
}
