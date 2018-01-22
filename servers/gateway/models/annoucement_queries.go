package models

import (
	"time"
)

// InsertNewAnnouncment inserts the given new annoucement into the database
// and returns an annoucement. Returns an error if one occured.
func (store *Database) InsertNewAnnouncment(newAnnoucement *NewAnnoucement) (*Annoucement, error) {
	postTime := time.Now()
	result, err := store.DB.Exec(`INSERT INTO Annoucements (PostDate, User, Message)
		VALUES (?, ?, ?)`, postTime, newAnnoucement.UserID, newAnnoucement.Message)
	if err != nil {
		return nil, err
	}
	announcmentID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	return &Annoucement{
		ID:       announcmentID,
		PostDate: postTime,
		UserID:   newAnnoucement.UserID,
		Message:  newAnnoucement.Message,
	}, nil
}
