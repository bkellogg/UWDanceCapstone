package models

import (
	"errors"
	"time"
)

// NewAudition defines the information required for a new audition
// submitted to the server
type NewAudition struct {
	Name      string    `json:"name"`
	Time      time.Time `json:"time"`
	CreatedBy int       `json:"-"` // will not be supplied by user but will be filled by handler
}

// Validate validates the new audition and returns an error
// if one occurred.
func (na *NewAudition) Validate() error {
	if len(na.Name) == 0 {
		return errors.New("new audition must have a name")
	}
	if na.Time.IsZero() {
		return errors.New("new audition must have a time")
	}
	if na.CreatedBy <= 0 {
		return errors.New("new audition must have a created by ID of greater than 0")
	}
	return nil
}

// Audition defines the information needed for an audition within
// the system
type Audition struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Time      time.Time `json:"time"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}
