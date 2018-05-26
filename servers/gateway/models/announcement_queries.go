package models

import (
	"database/sql"
	"fmt"
	"math"
	"net/http"
	"strconv"
	"time"
)

// InsertAnnouncement inserts the given new announcement into the database
// and returns an announcement. Returns an error if one occurred.
func (store *Database) InsertAnnouncement(na *NewAnnouncement) (*Announcement, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError("error beginning transaction: "+err.Error(), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query("SELECT AT.AnnouncementTypeID FROM AnnouncementType AT WHERE AT.AnnouncementTypeName = ?", na.AnnouncementType)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError(fmt.Sprintf("announcement type '%s' does not exist", na.AnnouncementType),
				http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error looking up announcement type: %v", err),
			http.StatusInternalServerError)
	}
	if !res.Next() {
		res.Close()
		return nil, NewDBError(fmt.Sprintf("announcement type '%s' does not exist", na.AnnouncementType),
			http.StatusNotFound)
	}
	at := AnnouncementType{}

	err = res.Scan(&at.ID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into announcement type: %v", err),
			http.StatusInternalServerError)
	}

	res.Close()

	postTime := time.Now()
	result, err := tx.Exec(`INSERT INTO Announcements (AnnouncementTypeID, Message, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`, at.ID, na.Message, postTime, na.UserID, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting announcement: %v", err), http.StatusInternalServerError)
	}
	announcementID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retreiving last insert id: %v", err), http.StatusInternalServerError)
	}

	tx.Commit()

	return &Announcement{
		ID:                 announcementID,
		AnnouncementTypeID: at.ID,
		Message:            na.Message,
		CreatedAt:          postTime,
		CreatedBy:          na.UserID,
	}, nil
}

// DeleteAnnouncementByID deletes the announcement with the given
// id.
func (store *Database) DeleteAnnouncementByID(id int) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()
	res, err := tx.Exec(`UPDATE Announcements A SET A.IsDeleted = TRUE WHERE A.AnnouncementID = ?`, id)
	if err != nil {
		return NewDBError(fmt.Sprintf("error deleting announcement: %v", err), http.StatusInternalServerError)
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving rows affected: %v", err), http.StatusInternalServerError)
	}
	if rowsAffected != 1 {
		return NewDBError("no announcement found", http.StatusNotFound)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// getAnnouncementTypeByName returns the announcementType that has that name or an error if one occurred.
func (store *Database) getAnnouncementTypeByName(name string, includeDeleted bool) (*AnnouncementType, error) {
	query := `SELECT * FROM AnnouncementType AT WHERE AT.AnnouncementTypeName = ?`
	if !includeDeleted {
		query += ` AND AT.IsDeleted = false`
	}
	row := store.db.QueryRow(query, name)
	at := &AnnouncementType{}
	if err := row.Scan(&at.ID, &at.Name, &at.Desc, &at.CreatedAt, &at.CreatedBy, &at.IsDeleted); err != nil {
		return nil, err
	}
	return at, nil
}

// InsertAnnouncementType inserts the given AnnouncementType into the database.
// Returns an error if one occurred.
func (store *Database) InsertAnnouncementType(at *AnnouncementType) *DBError {
	result, err := store.db.Exec(`INSERT INTO AnnouncementType (AnnouncementTypeName, AnnouncementTypeDesc,
		CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`, at.Name, at.Desc, at.CreatedAt, at.CreatedBy, at.IsDeleted)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting announcement type: %v", err), http.StatusInternalServerError)
	}
	atID, err := result.LastInsertId()
	if err != nil {
		return NewDBError(fmt.Sprintf("error getting last insert id: %v", err), http.StatusInternalServerError)
	}
	at.ID = atID
	return nil
}

// GetAnnouncementTypes returns a slice of AnnouncementTypes based on the filters provided.
// Returns an error if one occurred.
func (store *Database) GetAnnouncementTypes(includeDeleted bool) ([]*AnnouncementType, *DBError) {
	query := `SELECT * FROM AnnouncementType AT`
	if !includeDeleted {
		query += ` WHERE AT.IsDeleted = false`
	}
	result, err := store.db.Query(query)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no announcement types exist", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving announcement types: %v", err), http.StatusNotFound)
	}
	defer result.Close()
	announcementTypes := make([]*AnnouncementType, 0)
	for result.Next() {
		at := &AnnouncementType{}
		if err := result.Scan(&at.ID, &at.Name, &at.Desc, &at.CreatedAt, &at.CreatedBy, &at.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into announcement type: %v", err),
				http.StatusInternalServerError)
		}
		announcementTypes = append(announcementTypes, at)
	}
	return announcementTypes, nil
}

// GetAllAnnouncements gets the given page of announcements, optionally including deleted ones.
// returns an error if one occurred.
func (store *Database) GetAllAnnouncements(page int, includeDeleted bool, userID, typeName string) ([]*AnnouncementResponse, int, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, 0, NewDBError("error beginning transaction: "+err.Error(), http.StatusInternalServerError)
	}
	defer tx.Rollback()
	at := AnnouncementType{}

	// only attempt the look up the announcement type if we were passed a
	// valid typename.
	if len(typeName) > 0 {
		res, err := tx.Query("SELECT AT.AnnouncementTypeID FROM AnnouncementType AT WHERE AT.AnnouncementTypeName = ?", typeName)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, 0, NewDBError(fmt.Sprintf("announcement type '%s' does not exist", typeName),
					http.StatusNotFound)
			}
			return nil, 0, NewDBError(fmt.Sprintf("error looking up announcement type: %v", err),
				http.StatusInternalServerError)
		}
		if !res.Next() {
			res.Close()
			return nil, 0, NewDBError(fmt.Sprintf("announcement type '%s' does not exist", typeName),
				http.StatusNotFound)
		}

		err = res.Scan(&at.ID)
		if err != nil {
			return nil, 0, NewDBError(fmt.Sprintf("error scanning result into announcement type: %v", err),
				http.StatusInternalServerError)
		}
		res.Close()
	}
	tx.Commit()

	sqlStmt := &SQLStatement{
		Cols: `DISTINCT A.AnnouncementID, A.AnnouncementTypeID, A.Message, A.CreatedAt,
		A.IsDeleted, U.UserID, U.FirstName, U.LastName, U.Email, U.RoleID, U.Active`,
		Table: "Announcements A",
		Join:  "JOIN Users U ON A.CreatedBy = U.UserID",
		Where: "1 = 1",
		Page:  page,
	}

	if !includeDeleted {
		sqlStmt.Where += ` AND A.IsDeleted = FALSE`
	}
	if len(userID) > 0 {
		sqlStmt.Where += ` AND A.CreatedBy = ` + userID
	}
	if len(typeName) > 0 {
		sqlStmt.Where += ` AND A.AnnouncementTypeID = ` + strconv.Itoa(int(at.ID))
	}
	return store.processAnnouncementQuery(sqlStmt)
}

// handleAnnouncementsFromDatabase compiles the given result and err into a slice of AnnouncementResponse or an error.
func handleAnnouncementsFromDatabase(result *sql.Rows, err error) ([]*AnnouncementResponse, *DBError) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no announcement types found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving announcements: %v", err),
			http.StatusInternalServerError)
	}
	defer result.Close()
	announcements := make([]*AnnouncementResponse, 0)
	for result.Next() {
		a := &AnnouncementResponse{
			CreatedBy: &User{},
		}
		if err = result.Scan(&a.ID, &a.AnnouncementTypeID, &a.Message, &a.CreatedAt, &a.IsDeleted,
			&a.CreatedBy.ID, &a.CreatedBy.FirstName, &a.CreatedBy.LastName, &a.CreatedBy.Email,
			&a.CreatedBy.RoleID, &a.CreatedBy.Active); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into announcement: %v", err),
				http.StatusInternalServerError)
		}
		announcements = append(announcements, a)
	}
	if len(announcements) == 0 {
		return nil, NewDBError("no announcements found", http.StatusNotFound)
	}
	return announcements, nil
}

// processUserQuery runs the query with the given args and returns a slice of users
// that matched that query as well as the number of pages of users that matched
// that query. Returns a DBError if an error occurred.
func (store *Database) processAnnouncementQuery(sqlStmt *SQLStatement, args ...interface{}) ([]*AnnouncementResponse, int, *DBError) {
	announcements, dberr := handleAnnouncementsFromDatabase(store.db.Query(sqlStmt.BuildQuery(), args...))
	if dberr != nil {
		return nil, 0, dberr
	}
	numResults := 0
	rows, err := store.db.Query(sqlStmt.BuildCountQuery(), args...)
	if err != nil {
		return nil, 0, NewDBError(fmt.Sprintf("error querying for number of results: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, 0, NewDBError("count query returned no results", http.StatusInternalServerError)
	}
	if err = rows.Scan(&numResults); err != nil {
		return nil, 0, NewDBError(fmt.Sprintf("error scanning rows into num results: %v", err), http.StatusInternalServerError)
	}
	return announcements, int(math.Ceil(float64(numResults) / 25.0)), nil
}
