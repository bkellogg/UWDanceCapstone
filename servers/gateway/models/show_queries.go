package models

import (
	"database/sql"
	"errors"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// InsertNewShow inserts the given newShow into the database and returns the created Show
func (store *Database) InsertNewShow(newShow *NewShow) (*Show, error) {
	createTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO Shows (ShowName, AuditionID, EndDate, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		newShow.Name, newShow.AuditionID, newShow.EndDate, createTime, newShow.CreatedBy, false)
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
		EndDate:    newShow.EndDate,
		CreatedAt:  createTime,
		CreatedBy:  newShow.CreatedBy,
		IsDeleted:  false,
	}
	return show, nil
}

// GetShowByID returns the show with the given ID.
func (store *Database) GetShowByID(id int, includeDeleted bool) (*Show, error) {
	query := `SELECT * FROM Shows S WHERE S.ShowID = ?`
	if !includeDeleted {
		query += ` AND S.IsDeleted = false`
	}
	show := &Show{}
	err := store.db.QueryRow(query,
		id).Scan(
		&show.ID, &show.Name,
		&show.AuditionID, &show.EndDate, &show.CreatedAt,
		&show.CreatedBy, &show.IsDeleted)
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
	_, err := store.db.Exec(`UPDATE Shows SET IsDeleted = ? WHERE ShowID = ?`, true, id)
	return err
}

// GetShowsByUserID returns a slice of shows that the given user is in, or an error
// if one occurred.
func (store *Database) GetShowsByUserID(id, page int, includeDeleted bool, history string) ([]*Show, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT S.ShowID, S.ShowName, S.AuditionID, S.EndDate, S.CreatedAt, S.CreatedBy, S.IsDeleted FROM Shows S
		JOIN Pieces P ON S.ShowID = P.ShowID
		JOIN UserPiece UP ON P.PieceID = UP.PieceID
		WHERE UP.UserID = ?`
	if !includeDeleted {
		query += ` AND S.IsDeleted = false`
	}
	switch history {
	case "current":
		query += ` AND S.EndDate > NOW()`
	case "past":
		query += ` AND S.EndDate <= NOW()`
	case "all", "":
	default:
		return nil, errors.New(appvars.ErrInvalidHistoryOption)
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleShowsFromDatabase(store.db.Query(query, id, offset))
}

// GetShowsByAuditionID returns a slice of shows that are in the given audition
func (store *Database) GetShowsByAuditionID(id, page int, includeDeleted bool) ([]*Show, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT * FROM Shows S Where S.AuditionID = ?`
	if !includeDeleted {
		query += ` AND S.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleShowsFromDatabase(store.db.Query(query, id, offset))
}

// handleShowsFromDatabase returns a slice of shows from the given sql Rows, or an
// error if one occurred.
func handleShowsFromDatabase(result *sql.Rows, err error) ([]*Show, error) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	shows := make([]*Show, 0)
	for result.Next() {
		show := &Show{}
		if err = result.Scan(&show.ID, &show.Name, &show.AuditionID, &show.EndDate,
			&show.CreatedAt, &show.CreatedBy, &show.IsDeleted); err != nil {
			return nil, err
		}
		shows = append(shows, show)
	}
	return shows, nil
}
