package models

import "time"

// NewShow defines the information needed to create a new show.
type NewShow struct {
	Name       string    `json:"name"`
	AuditionID int       `json:"auditionID,omitempty"`
	EndDate    time.Time `json:"endDate"`
	CreatedBy  int       `json:"-"`
}

// Show defines the information needed to store a show.
type Show struct {
	ID         int       `json:"id"`
	Name       string    `json:"name"`
	AuditionID int       `json:"auditionID"`
	EndDate    time.Time `json:"endDate"`
	CreatedAt  time.Time `json:"createdAt"`
	CreatedBy  int       `json:"createdBy"`
	IsDeleted  bool      `json:"isDeleted"`
}
