package models

import (
	"errors"
	"time"
)

// NewAuditionComment defines how a request to create a new audition comment will
// look like.
type NewAuditionComment struct {
	UserAuditionID int    `json:"uaID"`
	Comment        string `json:"comment"`
	CreatedBy      int    `json:"-"` // will be populated by the handler
}

// Validate validates the content of the new audition comment
// and returns an error if one occurred.
func (nac *NewAuditionComment) Validate() error {
	if nac.UserAuditionID <= 0 {
		return errors.New("new audition comment must have a valid associated user audition")
	}
	if len(nac.Comment) == 0 {
		return errors.New("new audition comment must have a comment")
	}
	if nac.CreatedBy <= 0 {
		return errors.New("new audition comment cannot have been created by no one")
	}
	return nil
}

// AuditionComment defines how a comment about a user's audition is stored.
type AuditionComment struct {
	ID             int       `json:"id"`
	UserAuditionID int       `json:"uaID"`
	Comment        string    `json:"comment"`
	CreatedAt      time.Time `json:"createdAt"`
	CreatedBy      int       `json:"createdBy"`
	IsDeleted      bool      `json:"bool"`
}
