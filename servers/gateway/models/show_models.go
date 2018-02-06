package models

// NewShow defines the information needed to create a new show.
type NewShow struct {
	Name       string `json:"name"`
	AuditionID int    `json:"auditionID,omitempty"`
}

// Show defines the information needed to store a show.
type Show struct {
	ID         int    `json:"id"`
	Name       string `json:"name"`
	AuditionID int    `json:"auditionID"`
	IsDeleted  bool   `json:"isDeleted"`
}
