package models

import (
	"errors"
	"time"
)

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

// ShowTypeDefines how a ShowType will be stored in the database.
type ShowType struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Desc      string    `json:"desc"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}

// Validate validates the current show type to check
// if its ready to be inserted into the database.
func (st *ShowType) validate() error {
	if st.Name == "" {
		return errors.New("new show type must have a name")
	}
	if st.CreatedBy == 0 {
		return errors.New("new show type must have a createdBy value")
	}
	st.CreatedAt = time.Now()
	st.IsDeleted = false
	return nil
}
