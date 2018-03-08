package models

import (
	"errors"
	"time"
)

// NewStandAloneUserAuditionComment defines how a request to create a new audition comment will
// look like. This comment is made with a stand alone request and is not
// tied to the initial UserAudition creation request.
type NewStandAloneUserAuditionComment struct {
	UserAuditionID int    `json:"uaID"`
	Comment        string `json:"comment"`
	CreatedBy      int    `json:"-"` // will be populated by the handler
}

// Validate validates the content of the new audition comment
// and returns an error if one occurred.
func (nac *NewStandAloneUserAuditionComment) Validate() error {
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

// UserAuditionComment defines how a comment about a user's audition is stored.
type UserAuditionComment struct {
	ID             int       `json:"id"`
	UserAuditionID int       `json:"uaID"`
	Comment        string    `json:"comment"`
	CreatedAt      time.Time `json:"createdAt"`
	CreatedBy      int       `json:"createdBy"`
	IsDeleted      bool      `json:"bool"`
}
