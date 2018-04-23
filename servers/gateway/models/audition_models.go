package models

import (
	"errors"
	"time"
)

// NewAudition defines the information required for a new audition
// submitted to the server
type NewAudition struct {
	Time      time.Time `json:"time"`
	Location  string    `json:"location"`
	CreatedBy int       `json:"-"` // will not be supplied by user but will be filled by handler
	CreatedAt time.Time `json:"createdAt"`
}

// Validate validates the new audition and returns an error
// if one occurred.
func (na *NewAudition) Validate() error {
	if na.Time.IsZero() {
		return errors.New("new audition must have a time")
	}
	if len(na.Location) == 0 {
		return errors.New("new audition must have a location")
	}
	na.Time = na.Time.Local()
	na.CreatedAt = time.Now().Local()
	return nil
}

// Audition defines the information needed for an audition within
// the system
type Audition struct {
	ID        int       `json:"id"`
	Time      time.Time `json:"time"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}
