package models

import "database/sql"

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

// InsertNewShow inserts the given newShow into the database and returns the created Show
func (store *Database) InsertNewShow(newShow *NewShow) (*Show, error) {
	result, err := store.DB.Exec(`INSERT INTO Shows (ShowName, AuditionID, IsDeleted) VALUES (?, ?, ?)`,
		newShow.Name, newShow.AuditionID, false)
	if err != nil {
		return nil, err
	}
	showID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	show := &Show{
		ID:         int(showID),
		Name:       newShow.Name,
		AuditionID: newShow.AuditionID,
	}
	return show, nil
}

// GetShowByID returns the show with the given ID.
func (store *Database) GetShowByID(id int) (*Show, error) {
	show := &Show{}
	err := store.DB.QueryRow(`SELECT * FROM Shows S WHERE S.ShowID = ?`, id).Scan(
		&show.ID, &show.Name,
		&show.AuditionID, &show.IsDeleted)
	if err != nil {
		show = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return show, err
}

// DeleteShowByID marks the show with the given ID as deleted.
func (store *Database) DeleteShowByID(id int) error {
	_, err := store.DB.Exec(`UPDATE Shows SET IsDeleted = ? WHERE ShowID = ?`, true, id)
	return err
}

// GetShowsByAuditionID returns a slice of shows that are in the given audition
func (store *Database) GetShowsByAuditionID(id int) ([]*Show, error) {
	result, err := store.DB.Query(`SELECT * FROM Shows S Where S.AuditionID = ?`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	shows := make([]*Show, 0)
	for result.Next() {
		show := &Show{}
		if err = result.Scan(&show.ID, &show.Name, &show.AuditionID, &show.IsDeleted); err != nil {
			return nil, err
		}
		shows = append(shows, show)
	}
	return shows, nil
}
