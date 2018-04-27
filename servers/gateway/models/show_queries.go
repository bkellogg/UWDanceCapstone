package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// InsertNewShow inserts the given newShow into the database and returns the created Show
func (store *Database) InsertNewShow(newShow *NewShow) (*Show, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("erro beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query(`SELECT ShowTypeID FROM ShowType ST WHERE ST.ShowTypeName = ?`, newShow.TypeName)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("invalid show type", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving show type from database: %v", err), http.StatusInternalServerError)
	}
	if !res.Next() {
		return nil, NewDBError("invalid show type", http.StatusNotFound)
	}
	st := &ShowType{}
	if err = res.Scan(&st.ID); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into show type: %v", err), http.StatusInternalServerError)
	}
	res.Close()

	createTime := time.Now()
	result, err := tx.Exec(`INSERT INTO Shows (ShowTypeID, AuditionID, EndDate, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		st.ID, newShow.AuditionID, newShow.EndDate, createTime, newShow.CreatedBy, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting show: %v", err), http.StatusInternalServerError)
	}
	showID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	show := &Show{
		ID:         int(showID),
		AuditionID: newShow.AuditionID,
		TypeID:     st.ID,
		EndDate:    newShow.EndDate,
		CreatedAt:  createTime,
		CreatedBy:  newShow.CreatedBy,
		IsDeleted:  false,
	}
	return show, nil
}

// getShowTypeByName gets the ShowType associated with the given name, and returns an error
// if one occurred.
func (store *Database) getShowTypeByName(name string, includeDeleted bool) (*ShowType, *DBError) {
	query := `SELECT * FROM ShowType ST WHERE ST.ShowTypeName = ?`
	if !includeDeleted {
		query += ` AND ST.IsDeleted = false`
	}
	row := store.db.QueryRow(query, name)
	st := &ShowType{}
	if err := row.Scan(&st.ID, &st.Name, &st.Desc, &st.CreatedAt, &st.CreatedBy, &st.IsDeleted); err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no show type found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving show type from database: %v", err), http.StatusInternalServerError)
	}
	return st, nil
}

// InsertNewSHowType inserts the given show type into the database and returns
// an error if one occurred.
func (store *Database) InsertNewShowType(showType *ShowType) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("erro beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	result, err := tx.Exec(`INSERT INTO ShowType (ShowTypeName, ShowTypeDesc, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`, showType.Name, showType.Desc, showType.CreatedAt, showType.CreatedBy, showType.IsDeleted)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting show type: %v", err), http.StatusInternalServerError)
	}
	showTypeID, err := result.LastInsertId()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	showType.ID = int(showTypeID)
	return nil
}

// GetShowTypes returns a slice of ShowTypes based on the filters provided.
// Returns an error if one occurred.
func (store *Database) GetShowTypes(includeDeleted bool) ([]*ShowType, *DBError) {
	query := `SELECT * FROM ShowType ST`
	if !includeDeleted {
		query += ` WHERE ST.IsDeleted = false`
	}
	result, err := store.db.Query(query)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no show types found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving show types: %v", err), http.StatusInternalServerError)
	}
	showTypes := make([]*ShowType, 0)
	for result.Next() {
		st := &ShowType{}
		if err := result.Scan(&st.ID, &st.Name, &st.Desc, &st.CreatedAt, &st.CreatedBy, &st.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into show type: %v", err), http.StatusInternalServerError)
		}
		showTypes = append(showTypes, st)
	}
	return showTypes, nil
}

// GetShows gets the first 25 shows that match the given history and includeDeleted filters
// on the provided page, or an error if one occurred.
func (store *Database) GetShows(page int, history string, includeDeleted bool, typeName string) ([]*Show, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("erro beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	shouldFilterByType := len(typeName) != 0 && typeName != "all"
	st := &ShowType{}
	if shouldFilterByType {
		res, err := tx.Query(`SELECT ShowTypeID FROM ShowType ST WHERE ST.ShowTypeName = ?`, typeName)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, NewDBError("invalid show type", http.StatusNotFound)
			}
			return nil, NewDBError(fmt.Sprintf("error retrieving show type from database: %v", err), http.StatusInternalServerError)
		}
		if !res.Next() {
			return nil, NewDBError("invalid show type", http.StatusNotFound)
		}
		if err = res.Scan(&st.ID); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into show type: %v", err), http.StatusInternalServerError)
		}
		res.Close()
	}

	offset := getSQLPageOffset(page)
	// TODO: This is awful, but a quick fix for WHERE needing to be there
	query := `SELECT DISTINCT * FROM Shows S
 		WHERE 1 = 1`
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
		return nil, NewDBError(appvars.ErrInvalidHistoryOption, http.StatusBadRequest)
	}
	if shouldFilterByType {
		query += ` AND S.ShowTypeID = ` + strconv.Itoa(st.ID)
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleShowsFromDatabase(tx.Query(query, offset))
}

// GetShowByID returns the show with the given ID.
func (store *Database) GetShowByID(id int, includeDeleted bool) (*Show, error) {
	query := `SELECT DISTINCT * FROM Shows S
		WHERE S.ShowID = ?`
	if !includeDeleted {
		query += ` AND S.IsDeleted = false`
	}
	show := &Show{}
	err := store.db.QueryRow(query,
		id).Scan(
		&show.ID, &show.TypeID, &show.AuditionID,
		&show.EndDate, &show.CreatedAt,
		&show.CreatedBy, &show.IsDeleted)
	if err != nil {
		show = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return show, err
}

// GetShowByAuditionID gets the show that the given audition is for.
// Returns the show or an error if one occurred.
func (store *Database) GetShowByAuditionID(id int, includeDeleted bool) (*Show, *DBError) {
	query := `SELECT DISTINCT * FROM Shows S
		WHERE S.AuditionID = ?`
	if !includeDeleted {
		query += ` AND S.IsDeleted = false`
	}
	show := &Show{}
	err := store.db.QueryRow(query,
		id).Scan(
		&show.ID, &show.TypeID, &show.AuditionID,
		&show.EndDate, &show.CreatedAt,
		&show.CreatedBy, &show.IsDeleted)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error getting show: %v", err), http.StatusInternalServerError)
	}
	return show, nil
}

// DeleteShowByID marks the show with the given ID as deleted.
func (store *Database) DeleteShowByID(id int) error {
	_, err := store.db.Exec(`UPDATE Shows SET IsDeleted = ? WHERE ShowID = ?`, true, id)
	return err
}

// GetShowsByUserID returns a slice of shows that the given user is in, or an error
// if one occurred.
func (store *Database) GetShowsByUserID(id, page int, includeDeleted bool, history string) ([]*Show, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT S.ShowID, S.ShowTypeID, S.AuditionID, S.EndDate, S.CreatedAt, S.CreatedBy, S.IsDeleted FROM Shows S
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
		return nil, NewDBError(appvars.ErrInvalidHistoryOption, http.StatusBadRequest)
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleShowsFromDatabase(store.db.Query(query, id, offset))
}

// handleShowsFromDatabase returns a slice of shows from the given sql Rows, or an
// error if one occurred.
func handleShowsFromDatabase(result *sql.Rows, err error) ([]*Show, *DBError) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no shows found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving shows from database: %v", err), http.StatusInternalServerError)
	}
	shows := make([]*Show, 0)
	for result.Next() {
		show := &Show{}
		if err = result.Scan(&show.ID, &show.TypeID, &show.AuditionID, &show.EndDate,
			&show.CreatedAt, &show.CreatedBy, &show.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into show: %v", err), http.StatusInternalServerError)
		}
		shows = append(shows, show)
	}
	return shows, nil
}
