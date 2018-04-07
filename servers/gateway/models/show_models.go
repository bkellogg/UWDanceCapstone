package models

import (
	"errors"
	"time"
)

// NewShow defines the information needed to create a new show.
type NewShow struct {
	TypeName   string    `json:"typeName"`
	AuditionID int       `json:"auditionID,omitempty"`
	EndDate    time.Time `json:"endDate"`
	CreatedBy  int       `json:"-"`
}

// Validate validates the current new show and returns an error if one occurred.
func (ns *NewShow) Validate() error {
	if len(ns.TypeName) == 0 {
		return errors.New("new show must have a type")
	}
	return nil
}

// Show defines the information needed to store a show.
type Show struct {
	ID         int       `json:"id"`
	TypeID     int       `json:"typeID"`
	AuditionID int       `json:"auditionID"`
	EndDate    time.Time `json:"endDate"`
	CreatedAt  time.Time `json:"createdAt"`
	CreatedBy  int       `json:"createdBy"`
	IsDeleted  bool      `json:"isDeleted"`
}

// ShowType defines how a ShowType will be stored in the database.
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
func (st *ShowType) Validate() error {
	if st.Name == "" {
		return errors.New("new show type must have a name")
	}
	if len(st.Name) > 3 {
		return errors.New("new show type name can only be 3 characters long")
	}
	st.CreatedAt = time.Now()
	st.IsDeleted = false
	return nil
}
