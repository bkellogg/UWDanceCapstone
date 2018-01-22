package models

import (
	"time"
)

// Annoucement defines the structure of how a system-wide
// annoucement will be stored inside of the database.
type Annoucement struct {
	ID       int64     `json:"id"`
	PostDate time.Time `json:"postDate"`
	UserID   int64     `json:"userID"`
	Message  string    `json:"message"`
}

// WebSocketAnnoucement defines the structure of how a
// system-wide annoucement will be written back to the
// client over a web socket connection.
type WebSocketAnnoucement struct {
	ID       int64     `json:"id"`
	PostDate time.Time `json:"postDate"`
	User     *User     `json:"user"`
	Message  string    `json:"message"`
}

// NewAnnoucement defines the structure of how an annoucement will be given to
// the system to post.
type NewAnnoucement struct {
	Message string `json:"message"`
	UserID  int64  `json:"userID"`
}
