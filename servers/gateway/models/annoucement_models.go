package models

import (
	"time"
)

// Annoucement defines the structure of how a system-wide
// annoucement will be
type Annoucement struct {
	ID       int64     `json:"id"`
	PostDate time.Time `json:"postDate"`
	UserID   int64     `json:"userID"`
	Message  string    `json:"message"`
}

// NewAnnoucement defines the structure of how an annoucement will be given to
// the system to post.
type NewAnnoucement struct {
	Message string `json:"message"`
	UserID  int64  `json:"userID"`
}
