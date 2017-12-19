package models

import (
	"database/sql"
)

// NewAudition defines the informtion required for a new audition
// submitted to the server
type NewAudition struct {
	Name     string `json:"name"`
	Date     string `json:"date"`
	Time     string `json:"time"`
	Location string `json:"location"`
	Quarter  string `json:"quarter"`
	Year     int    `json:"year"`
}

// Audition defines the information needed for an audition within
// the system
type Audition struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	Date      string `json:"date"`
	Time      string `json:"time"`
	Location  string `json:"location"`
	Quarter   string `json:"quarter"`
	Year      int    `json:"year"`
	IsDeleted bool   `json:"isDeleted"`
}

// InsertNewAudition inserts a new audition and returns its id.
func (store *Database) InsertNewAudition(newAud *NewAudition) (*Audition, error) {
	result, err := store.DB.Exec(`INSERT INTO Auditions (AuditionName, AuditionDate,
		AuditionTime, AuditionLocation,
		Quarter, Year, IsDeleted) VALUES (?, ?, ?, ?, ?, ?, ?)`, newAud.Name, newAud.Date,
		newAud.Time, newAud.Location, newAud.Quarter, newAud.Year, false)
	if err != nil {
		return nil, err
	}
	audID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	audition := &Audition{
		ID:        int(audID),
		Name:      newAud.Name,
		Date:      newAud.Date,
		Time:      newAud.Time,
		Location:  newAud.Location,
		Quarter:   newAud.Quarter,
		Year:      newAud.Year,
		IsDeleted: false,
	}
	return audition, nil
}

// GetAuditionByName returns the audition with the given name.
func (store *Database) GetAuditionByName(name string) (*Audition, error) {
	audition := &Audition{}
	err := store.DB.QueryRow(`SELECT * FROM Auditions A WHERE A.AuditionName = ?`, name).Scan(
		&audition.ID, &audition.Name,
		&audition.Date, &audition.Location,
		&audition.Quarter, &audition.Year,
		&audition.IsDeleted)
	if err != nil {
		audition = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return audition, err
}

// GetAuditionByID returns the audition with the given ID.
func (store *Database) GetAuditionByID(id int) (*Audition, error) {
	audition := &Audition{}
	err := store.DB.QueryRow(`SELECT * FROM Auditions A WHERE A.AuditionID = ?`, id).Scan(
		&audition.ID, &audition.Name,
		&audition.Date, &audition.Time,
		&audition.Location, &audition.Quarter,
		&audition.Year, &audition.IsDeleted)
	if err != nil {
		audition = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return audition, err
}

// DeleteAuditionByID marks the audition with the given ID as deleted.
func (store *Database) DeleteAuditionByID(id int) error {
	_, err := store.DB.Exec(`UPDATE Auditions SET IsDeleted = ? WHERE AuditionID = ?`, true, id)
	return err
}
