package models

// Audition defines the information needed for an audition within
// the system
type Audition struct {
	AuditionID int
}

// InsertNewAudition inserts a new audition and returns its id.
func (store *Database) InsertNewAudition() (int, error) {
	return 0, nil
}
