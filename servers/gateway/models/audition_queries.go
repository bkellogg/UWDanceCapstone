package models

import (
	"database/sql"
)

// InsertNewAudition inserts a new audition and returns its id.
func (store *Database) InsertNewAudition(newAud *NewAudition) (*Audition, error) {
	result, err := store.db.Exec(`INSERT INTO Auditions (Name, Time, Location, Quarter, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		newAud.Name, newAud.Time, newAud.Location, newAud.Quarter, newAud.CreatedAt, newAud.CreatedBy, false)
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
		Time:      newAud.Time,
		Location:  newAud.Location,
		Quarter:   newAud.Quarter,
		CreatedAt: newAud.CreatedAt,
		CreatedBy: newAud.CreatedBy,
		IsDeleted: false,
	}
	return audition, nil
}

// GetAuditionByName returns the audition with the given name.
func (store *Database) GetAuditionByName(name string, includeDeleted bool) (*Audition, error) {
	query := `SELECT * FROM Auditions A WHERE A.Name = ?`
	if !includeDeleted {
		query += ` AND A.IsDeleted = false`
	}
	audition := &Audition{}
	err := store.db.QueryRow(query,
		name).Scan(
		&audition.ID, &audition.Name, &audition.Time,
		&audition.Location, &audition.Quarter, &audition.CreatedAt,
		&audition.CreatedBy, &audition.IsDeleted)
	if err != nil {
		audition = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	audition.CreatedAt = audition.CreatedAt.In(store.tz)
	audition.Time = audition.Time.In(store.tz)
	return audition, err
}

// GetAuditionByID returns the audition with the given ID.
func (store *Database) GetAuditionByID(id int, includeDeleted bool) (*Audition, error) {
	query := `SELECT * FROM Auditions A WHERE A.AuditionID = ?`
	if !includeDeleted {
		query += ` AND A.IsDeleted = false`
	}
	audition := &Audition{}
	err := store.db.QueryRow(query,
		id).Scan(
		&audition.ID, &audition.Name, &audition.Time,
		&audition.Location, &audition.Quarter, &audition.CreatedAt,
		&audition.CreatedBy, &audition.IsDeleted)
	if err != nil {
		audition = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	audition.CreatedAt = audition.CreatedAt.In(store.tz)
	audition.Time = audition.Time.In(store.tz)
	return audition, err
}

// DeleteAuditionByID marks the audition with the given ID as deleted.
func (store *Database) DeleteAuditionByID(id int) error {
	_, err := store.db.Exec(`UPDATE Auditions SET IsDeleted = ? WHERE AuditionID = ?`, true, id)
	return err
}
