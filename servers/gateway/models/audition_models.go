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
	Location  string    `json:"location"`
	Quarter   string    `json:"quarter"`
	CreatedBy int       `json:"-"` // will not be supplied by user but will be filled by handler
	CreatedAt time.Time `json:"createdAt"`
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
	if len(na.Location) == 0 {
		return errors.New("new audition must have a location")
	}
	if na.Quarter != "autumn" && na.Quarter != "winter" && na.Quarter != "spring" && na.Quarter != "summer" {
		return errors.New("new audition must be in autumn, winter, fall or spring")
	}
	na.Time = na.Time.Local()
	na.CreatedAt = time.Now().Local()
	return nil
}

// Audition defines the information needed for an audition within
// the system
type Audition struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Time      time.Time `json:"time"`
	Location  string    `json:"location"`
	Quarter   string    `json:"quarter"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}
