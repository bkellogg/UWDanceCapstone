package models

import (
	"errors"
	"time"
)

// Announcement defines the structure of how a system-wide
// announcement will be stored inside of the database.
type Announcement struct {
	ID                 int64     `json:"id"`
	AnnouncementTypeID int64     `json:"typeID"`
	Message            string    `json:"message"`
	CreatedAt          time.Time `json:"createdAt"`
	CreatedBy          int64     `json:"createdBy"`
	IsDeleted          bool      `json:"isDeleted"`
}

// AnnouncementResponse defines the structure of how a
// system-wide announcement will be written back to the
// client.
type AnnouncementResponse struct {
	ID                 int64     `json:"id"`
	AnnouncementTypeID int64     `json:"typeID"`
	Message            string    `json:"message"`
	CreatedAt          time.Time `json:"createdAt"`
	CreatedBy          *User     `json:"createdBy"`
	IsDeleted          bool      `json:"isDeleted"`
}

// NewAnnouncement defines the structure of how an announcement will be given to
// the system to post.
type NewAnnouncement struct {
	AnnouncementType string `json:"type"`
	Message          string `json:"message"`
	UserID           int64  `json:"userID"`
}

// Validate validates the current new announcement and returns an error
// if one occurred.
func (na *NewAnnouncement) Validate() error {
	if len(na.AnnouncementType) == 0 {
		return errors.New("new announcement must have a type")
	}
	if len(na.Message) == 0 {
		return errors.New("new announcement must have a message")
	}
	if na.UserID == 0 {
		return errors.New("new announcement must have a userID")
	}
	return nil
}

func (a *Announcement) AsAnnouncementResponse(u *User) *AnnouncementResponse {
	return &AnnouncementResponse{
		ID:        a.ID,
		CreatedAt: a.CreatedAt,
		CreatedBy: u,
		Message:   a.Message,
		IsDeleted: a.IsDeleted,
	}
}

// AnnouncementType defines how an announcement type is stored in the database.
type AnnouncementType struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Desc      string    `json:"desc"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}

// Validate validates the new announcement type and returns an error
// if one occurred.
func (at *AnnouncementType) Validate() error {
	if at.ID != 0 {
		return errors.New("announcement type already has an ID; this has probably already been inserted")
	}
	if len(at.Name) == 0 {
		return errors.New("announcement type must have a name")
	}
	if at.CreatedBy == 0 {
		return errors.New("announcement type must have a value for created by")
	}
	at.CreatedAt = time.Now()
	at.IsDeleted = false
	return nil
}
