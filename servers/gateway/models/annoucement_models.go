package models

import (
	"time"
)

// Announcement defines the structure of how a system-wide
// announcement will be stored inside of the database.
type Announcement struct {
	ID        int64     `json:"id"`
	PostDate  time.Time `json:"postDate"`
	UserID    int64     `json:"userID"`
	Message   string    `json:"message"`
	IsDeleted bool      `json:"isDeleted"`
}

// AnnouncementResponse defines the structure of how a
// system-wide announcement will be written back to the
// client.
type AnnouncementResponse struct {
	ID        int64     `json:"id"`
	PostDate  time.Time `json:"postDate"`
	User      *User     `json:"user"`
	Message   string    `json:"message"`
	IsDeleted bool      `json:"isDeleted"`
}

// NewAnnouncement defines the structure of how an annoucement will be given to
// the system to post.
type NewAnnouncement struct {
	Message string `json:"message"`
	UserID  int64  `json:"userID"`
}

func (a *Announcement) AsAnnouncementResponse(u *User) *AnnouncementResponse {
	return &AnnouncementResponse{
		ID:        a.ID,
		PostDate:  a.PostDate,
		User:      u,
		Message:   a.Message,
		IsDeleted: a.IsDeleted,
	}
}
