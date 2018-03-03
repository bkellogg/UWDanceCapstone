package models

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// InsertNewShow inserts the given newShow into the database and returns the created Show
func (store *Database) InsertNewShow(newShow *NewShow) (*Show, error) {
	st, err := store.getShowTypeByName(newShow.TypeName, false)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, errors.New("error looking up show type: " + err.Error())
	}
	createTime := time.Now()
	result, err := store.db.Exec(`INSERT INTO Shows (ShowTypeID, AuditionID, EndDate, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		st.ID, newShow.AuditionID, newShow.EndDate, createTime, newShow.CreatedBy, false)
	if err != nil {
		return nil, err
	}
	showID, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	show := &Show{
		ID:         int(showID),
		TypeID:     st.ID,
		AuditionID: newShow.AuditionID,
		EndDate:    newShow.EndDate,
		CreatedAt:  createTime,
		CreatedBy:  newShow.CreatedBy,
		IsDeleted:  false,
	}
	return show, nil
}

// getShowTypeByName gets the ShowType associated with the given name, and returns an error
// if one occurred.
func (store *Database) getShowTypeByName(name string, includeDeleted bool) (*ShowType, error) {
	query := `SELECT * FROM ShowType ST WHERE ST.ShowTypeName = ?`
	if !includeDeleted {
		query += ` AND ST.IsDeleted = false`
	}
	row := store.db.QueryRow(query, name)
	st := &ShowType{}
	if err := row.Scan(&st.ID, &st.Name, &st.Desc, &st.CreatedAt, &st.CreatedBy, &st.IsDeleted); err != nil {
		return nil, err
	}
	return st, nil
}

// InsertNewSHowType inserts the given show type into the database and returns
// an error if one occurred.
func (store *Database) InsertNewShowType(showType *ShowType) error {
	if err := showType.validate(); err != nil {
		return errors.New("show type validation failed: " + err.Error())
	}
	result, err := store.db.Exec(`INSERT INTO ShowType (ShowTypeName, ShowTypeDesc, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`, showType.Name, showType.Desc, showType.CreatedAt, showType.CreatedBy, showType.IsDeleted)
	if err != nil {
		return errors.New("error inserting new show type: " + err.Error())
	}
	showTypeID, err := result.LastInsertId()
	if err != nil {
		return errors.New("error getting show type ID: " + err.Error())
	}
	showType.ID = int(showTypeID)
	return nil
}

// GetShowTypes returns a slice of ShowTypes based on the filters provided.
// Returns an error if one occurred.
func (store *Database) GetShowTypes(includeDeleted bool) ([]*ShowType, error) {
	query := `SELECT * FROM ShowType ST`
	if !includeDeleted {
		query += ` WHERE ST.IsDeleted = false`
	}
	result, err := store.db.Query(query)
	if err != nil {
		return nil, errors.New("error getting show types: " + err.Error())
	}
	showTypes := make([]*ShowType, 0)
	for result.Next() {
		st := &ShowType{}
		if err := result.Scan(&st.ID, &st.Name, &st.Desc, &st.CreatedAt, &st.CreatedBy, &st.IsDeleted); err != nil {
			return nil, err
		}
		showTypes = append(showTypes, st)
	}
	return showTypes, nil
}

// GetShows gets the first 25 shows that match the given history and includeDeleted filters
// on the provided page, or an error if one occurred.
func (store *Database) GetShows(page int, history string, includeDeleted bool, typeName string) ([]*Show, error) {
	var st *ShowType
	var err error
	if len(typeName) > 0 {
		st, err = store.getShowTypeByName(typeName, includeDeleted)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, err
			}
			return nil, errors.New("error looking up show type name: " + err.Error())
		}
	}
	offset := getSQLPageOffset(page)
	// TODO: This is awful, but a quick fix for WHERE needing to be there
	query := `SELECT * FROM Shows S WHERE 1 = 1`
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
	if st != nil {
		query += ` AND S.ShowTypeID = ` + strconv.Itoa(st.ID)
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleShowsFromDatabase(store.db.Query(query, offset))
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
		&show.ID, &show.TypeID,
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
	query := `SELECT S.ShowID, S.ShowTypeID, S.AuditionID, S.EndDate, S.CreatedAt, S.CreatedBy, S.IsDeleted FROM Shows S
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
		if err = result.Scan(&show.ID, &show.TypeID, &show.AuditionID, &show.EndDate,
			&show.CreatedAt, &show.CreatedBy, &show.IsDeleted); err != nil {
			return nil, err
		}
		shows = append(shows, show)
	}
	return shows, nil
}
