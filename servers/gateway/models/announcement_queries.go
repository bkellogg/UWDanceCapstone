package models

import (
	"database/sql"
	"fmt"
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
func (store *Database) GetAllAnnouncements(page int, includeDeleted bool, userID, typeName string) ([]*AnnouncementResponse, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError("error beginning transaction: "+err.Error(), http.StatusInternalServerError)
	}
	defer tx.Rollback()
	at := AnnouncementType{}

	// only attempt the look up the announcement type if we were passed a
	// valid typename.
	if len(typeName) > 0 {
		res, err := tx.Query("SELECT AT.AnnouncementTypeID FROM AnnouncementType AT WHERE AT.AnnouncementTypeName = ?", typeName)
		if err != nil {
			if err == sql.ErrNoRows {
				return nil, NewDBError(fmt.Sprintf("announcement type '%s' does not exist", typeName),
					http.StatusNotFound)
			}
			return nil, NewDBError(fmt.Sprintf("error looking up announcement type: %v", err),
				http.StatusInternalServerError)
		}
		if !res.Next() {
			res.Close()
			return nil, NewDBError(fmt.Sprintf("announcement type '%s' does not exist", typeName),
				http.StatusNotFound)
		}

		err = res.Scan(&at.ID)
		if err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into announcement type: %v", err),
				http.StatusInternalServerError)
		}
		res.Close()
	}

	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT A.AnnouncementID, A.AnnouncementTypeID, A.Message, A.CreatedAt, A.IsDeleted,
		U.UserID, U.FirstName, U.LastName, U.Email, U.RoleID, U.Active FROM Announcements A
		JOIN Users U ON A.CreatedBy = U.UserID`
	if !includeDeleted {
		query += ` WHERE A.IsDeleted = FALSE`
	}
	if len(userID) > 0 {
		query += ` AND A.CreatedBy = ` + userID
	}
	if len(typeName) > 0 {
		query += ` AND A.AnnouncementTypeID = ` + strconv.Itoa(int(at.ID))
	}
	query += ` LIMIT 25 OFFSET ?`
	tx.Commit()
	return handleAnnouncementsFromDatabase(store.db.Query(query, offset))
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
