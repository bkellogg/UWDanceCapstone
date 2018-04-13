package models

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// UserIsInPiece returns true if the given user is in the given piece or an error if one occurred.
func (store *Database) UserIsInPiece(userID, pieceID int) (bool, *DBError) {
	result, err := store.db.Query(`SELECT * FROM UserPiece UP WHERE UP.UserID = ? AND UP.PieceID = ? AND UP.IsDeleted = ?`,
		userID, pieceID, false)
	if result == nil {
		return false, NewDBError(fmt.Sprintf("error determining if user is in piece: %v", err), http.StatusInternalServerError)
	}
	defer result.Close()
	return result.Next(), nil
}

// UserIsInAudition returns true if the given user is in the given audition or an error if one occurred.
func (store *Database) UserIsInAudition(userID, audID int) (bool, *DBError) {
	result, err := store.db.Query(`SELECT * FROM UserAudition UP WHERE UP.UserID = ? AND UP.AuditionID = ? AND UP.IsDeleted = ?`,
		userID, audID, false)
	if result == nil {
		return false, NewDBError(fmt.Sprintf("error determining if user is in audition: %v", err), http.StatusInternalServerError)
	}
	defer result.Close()
	return result.Next(), nil
}

// AddUserToPiece adds the given user to the given piece.
func (store *Database) AddUserToPiece(userID, pieceID int) *DBError {
	_, dberr := store.GetPieceByID(pieceID, false)
	if dberr != nil {
		return dberr
	}
	addTime := time.Now()
	exists, dberr := store.UserIsInPiece(userID, pieceID)
	if dberr != nil {
		return dberr
	}
	if exists {
		return NewDBError("user is already in this piece", http.StatusBadRequest)
	}
	_, err := store.db.Exec(`INSERT INTO UserPiece (UserID, PieceID, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?)`,
		userID, pieceID, addTime, false)
	if err != nil {
		return NewDBError(fmt.Sprintf("error isnerting user piece link: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// ChangeUserRole sets the role of the given user ID to role.
// Returns an error if one occurred.
func (store *Database) ChangeUserRole(userID int, roleName string) error {
	tx, err := store.db.Begin()
	if err != nil {
		return errors.New("error beginning transaction: " + err.Error())
	}

	rows, err := tx.Query(`SELECT * FROM Role R WHERE R.RoleName = ?`, roleName)
	if err != nil {
		if err == sql.ErrNoRows {
			return errors.New(appvars.ErrNoRoleFound)
		}
		return errors.New("error querying role: " + err.Error())
	}
	role := &Role{}
	if rows.Next() {
		err = rows.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level, &role.IsDeleted)
		if err != nil {
			return errors.New("error scanning role query into role: " + err.Error())
		}
	} else {
		return errors.New(appvars.ErrNoRoleFound)
	}
	rows.Close()

	rows, err = tx.Query(`SELECT * FROM Users U Where U.UserID = ?`, userID)
	if err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			return errors.New(appvars.ErrNoUserFound)
		}
		return errors.New("error querying user: " + err.Error())
	}
	if !rows.Next() {
		return errors.New(appvars.ErrNoUserFound)
	}
	rows.Close()

	_, err = tx.Exec(`UPDATE Users U SET U.RoleID = ? WHERE U.UserID = ?`, role.ID, userID)
	if err != nil {
		tx.Rollback()
		return errors.New("error updating user: " + err.Error())
	}

	if err = tx.Commit(); err != nil {
		return errors.New("error committing transaction: " + err.Error())
	}
	return nil
}

// RemoveUserFromPiece removes the given user from the given piece.
func (store *Database) RemoveUserFromPiece(userID, pieceID int) *DBError {
	_, dberr := store.GetPieceByID(pieceID, false)
	if dberr != nil {
		return dberr
	}
	_, err := store.db.Exec(`UPDATE UserPiece UP SET UP.IsDeleted = ? WHERE UP.UserID = ? AND UP.PieceID = ?`,
		true, userID, pieceID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error removing user from piece: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// AddUserToAudition adds the given user to the given audition. Returns an error
// if one occurred.
func (store *Database) AddUserToAudition(userID, audID, creatorID int, availability *WeekTimeBlock, comment string) *DBError {
	audition, dberr := store.GetAuditionByID(audID, false)
	if dberr != nil {
		return dberr
	}
	if audition == nil {
		return NewDBError(appvars.ErrAuditionDoesNotExist, http.StatusNotFound)
	}
	addTime := time.Now()
	exists, dberr := store.UserIsInAudition(userID, audID)
	if dberr != nil {
		return dberr
	}
	if exists {
		return NewDBError(appvars.ErrUserAlreadyInAudition, http.StatusBadRequest)
	}

	dayMap, err := availability.ToSerializedDayMap()
	if err != nil {
		return NewDBError(err.Error(), http.StatusBadRequest)
	}

	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()
	res, err := tx.Exec(`INSERT INTO UserAuditionAvailability
		(Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		dayMap["sun"], dayMap["mon"], dayMap["tues"], dayMap["wed"], dayMap["thurs"], dayMap["fri"], dayMap["sat"], addTime, false)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting user audition availability: %v", err), http.StatusInternalServerError)
	}
	availID, err := res.LastInsertId()
	if err != nil {
		return NewDBError(fmt.Sprintf("error getting insert ID of new availability: %v", err), http.StatusInternalServerError)
	}
	res, err = tx.Exec(`INSERT INTO UserAudition (AuditionID, UserID, AvailabilityID, CreatedBy, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		audID, userID, availID, creatorID, addTime, false)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting user audition: %v", err), http.StatusInternalServerError)
	}
	userAudID, err := res.LastInsertId()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	if len(comment) > 0 {
		_, err = tx.Exec(`INSERT INTO UserAuditionComment (UserAuditionID, Comment, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
			userAudID, comment, addTime, creatorID, false)
		if err != nil {
			return NewDBError(fmt.Sprintf("error inserting user audition comment: %v", err), http.StatusInternalServerError)
		}
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// RemoveUserFromPiece removes the given user from the given audition.
func (store *Database) RemoveUserFromAudition(userID, audID int) *DBError {
	_, dberr := store.GetAuditionByID(audID, false)
	if dberr != nil {
		return dberr
	}
	_, err := store.db.Exec(`UPDATE UserAudition UP SET UP.IsDeleted = ? WHERE UP.UserID = ? AND UP.AuditionID = ?`,
		true, userID, audID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error removing user from audition: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// GetAllUsers returns a slice of users of every user in the database, active or not.
// Returns an error if one occurred
func (store *Database) GetAllUsers(page int, includeInactive bool) ([]*User, *DBError) {
	offset := strconv.Itoa((page - 1) * 25)
	query := `SELECT * FROM Users U `
	if !includeInactive {
		query += `WHERE U.Active = true `
	}
	query += `LIMIT 25 OFFSET ` + offset

	return handleUsersFromDatabase(store.db.Query(query))
}

// ContainsUser returns true if this database contains a user with the same
// email as the given newUser object. Returns an error if one occurred
func (store *Database) ContainsUser(newUser *NewUserRequest) (bool, *DBError) {
	user, err := store.GetUserByEmail(newUser.Email, true)
	if err != nil {
		if err.HTTPStatus == http.StatusNotFound {
			return false, nil
		}
		return false, err
	}
	return user == nil, nil
}

// InsertNewUser inserts the given new user into the store
// and populates the ID field of the user
func (store *Database) InsertNewUser(user *User) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query(`SELECT R.RoleID FROM Role R WHERE R.RoleName = ?`, appvars.RoleDancer)
	if err != nil {
		if err == sql.ErrNoRows {
			return NewDBError(fmt.Sprintf("no role found with name %s", appvars.RoleDancer), http.StatusNotFound)
		}
		return NewDBError(fmt.Sprintf("error retrieving role from database: %v", err), http.StatusInternalServerError)
	}
	if !res.Next() {
		return NewDBError(fmt.Sprintf("no role found with name %s", appvars.RoleDancer), http.StatusNotFound)
	}
	role := &Role{}
	if err = res.Scan(&role.ID); err != nil {
		return NewDBError(fmt.Sprintf("error scanning result into role: %v", err), http.StatusInternalServerError)
	}
	res.Close()

	result, err := tx.Exec(
		`INSERT INTO Users (FirstName, LastName, Email, Bio, PassHash, RoleID, Active, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, "", user.PassHash, role.ID, true, user.CreatedAt)
	if err != nil {
		return NewDBError(fmt.Sprintf("error inserting user: %v", err), http.StatusInternalServerError)
	}
	user.ID, err = result.LastInsertId()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error commiting transaction: %v", err), http.StatusInternalServerError)
	}
	user.RoleID = int(role.ID)
	return nil
}

// GetUserByID gets the user with the given id, if it exists and it is active.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByID(id int, includeInactive bool) (*User, *DBError) {
	query := `SELECT * FROM Users U WHERE U.UserID =?`
	if !includeInactive {
		query += ` AND U.Active = true`
	}
	user := &User{}
	err := store.db.QueryRow(
		query, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Bio, &user.PassHash, &user.RoleID, &user.Active, &user.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no user found with the given email", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving user from database: %v", err), http.StatusInternalServerError)
	}
	return user, nil
}

// GetUserByEmail gets the user with the given email, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByEmail(email string, includeInactive bool) (*User, *DBError) {
	query := `SELECT * FROM Users U WHERE U.Email =?`
	if !includeInactive {
		query += ` AND U.Active = true`
	}
	user := &User{}
	err := store.db.QueryRow(
		query,
		email).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Bio, &user.PassHash, &user.RoleID, &user.Active, &user.CreatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no user found with the given email", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving user from database: %v", err), http.StatusInternalServerError)
	}
	return user, nil
}

// UpdateUserByID updates the user with the given ID to match the values
// of newValues. Returns an error if one occurred.
func (store *Database) UpdateUserByID(userID int, updates *UserUpdates, includeInactive bool) *DBError {
	query := `
		UPDATE Users U SET 
		U.FirstName = COALESCE(NULLIF(?, ''), FirstName),
		U.LastName = COALESCE(NULLIF(?, ''), LastName),
		U.Bio = COALESCE(NULLIF(?, ''), Bio)
		WHERE U.UserID = ?`
	if !includeInactive {
		query += ` AND U.Active = true`
	}
	_, err := store.db.Exec(query, updates.FirstName, updates.LastName, updates.Bio, userID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error updating user: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// DeactivateUserByID marks the user with the given userID as inactive. Returns
// an error if one occured.
func (store *Database) DeactivateUserByID(userID int) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	result, err := tx.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, false, userID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error deactivating user by id: %v", err), http.StatusInternalServerError)
	}
	numRows, err := result.RowsAffected()
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving rows affected %v", err), http.StatusInternalServerError)
	}
	if numRows == 0 {
		return NewDBError("no user exists with the given id", http.StatusNotFound)
	}
	return nil
}

// ActivateUserByID marks the user with the given userID as active. Returns
// an error if one occured.
func (store *Database) ActivateUserByID(userID int) *DBError {
	_, err := store.db.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, true, userID)
	return NewDBError(fmt.Sprintf("error activating user: %v", err), http.StatusInternalServerError)
}

// TODO: Modularize these GetUsersByX functions...

// GetUsersByAuditionID returns a slice of users that are in the given audition, if any.
// Returns an error if one occurred.
func (store *Database) GetUsersByAuditionID(id, page int, includeDeleted bool) ([]*User, *DBError) {
	return nil, NewDBError("brendan needs to fix this", http.StatusNotImplemented)
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.Bio, U.PassHash, U.RoleID, U.Active, U.CreatedAt FROM Users U
	JOIN UserPiece UP On UP.UserID = U.UserID
	JOIN Pieces P ON P.PieceID = UP.PieceID
	JOIN Shows S ON S.ShowID = P.ShowID
	WHERE S.AuditionID = ?`
	if !includeDeleted {
		query += ` AND UP.IsDeleted = FALSE
		AND P.IsDeleted = FALSE
		AND S.IsDeleted = FALSE`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleUsersFromDatabase(store.db.Query(query, id, offset))
}

// GetUsersByShowID returns a slice of users that are in the given show, if any.
// Returns an error if one occurred.
func (store *Database) GetUsersByShowID(id, page int, includeDeleted bool) ([]*User, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	offset := getSQLPageOffset(page)
	result, err := tx.Query(`
		SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.PassHash, U.RoleID, U.RoleID, U.Active, U.CreatedAt FROM Users U
		JOIN UserPiece UP ON U.UserID = UP.UserID
		JOIN Pieces P ON UP.PieceID = P.PieceID
		WHERE P.ShowID = ? AND UP.IsDeleted = false
		LIMIT 25 OFFSET ?`, id, offset)
	users, dberr := handleUsersFromDatabase(result, err)
	if dberr != nil {
		return nil, dberr
	}
	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return users, nil
}

// GetUsersByPieceID returns a slice of users that are in the given piece, if any.
// Returns an error if one occurred.
func (store *Database) GetUsersByPieceID(id, page int, includeDeleted bool) ([]*User, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.Bio, U.PassHash, U.RoleID, U.Active, U.CreatedAt FROM Users U
	JOIN UserPiece UP On UP.UserID = U.UserID
	WHERE UP.PieceID = ?`
	if !includeDeleted {
		query += ` AND UP.IsDeleted = FALSE`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleUsersFromDatabase(store.db.Query(query, id, offset))
}

// UpdatePasswordByID changes the user with the given IDs passhash to the given
// byte slice representing the new passhash.
func (store *Database) UpdatePasswordByID(id int, passHash []byte) error {
	query := `UPDATE Users SET PassHash = ? WhERE UserID = ?`
	_, err := store.db.Query(query, passHash, id)
	return err
}

// getUserRoleLevel gets the role level of the given user.
// Returns an error if one occurred.
func (store *Database) getUserRoleLevel(userID int64) (int, error) {
	rows, err := store.db.Query(`
		SELECT RoleLevel FROM Role R
			JOIN Users U ON U.RoleID = R.RoleID
			WHERE U.UserID = ?`, userID)
	if err != nil {
		return -1, err
	}
	defer rows.Close()
	if !rows.Next() {
		return -1, sql.ErrNoRows
	}
	role := 0
	if err = rows.Scan(&role); err != nil {
		return -1, err
	}
	return role, nil
}

// handleUsersFromDatabase compiles the given result and err into a slice of users or an error.
func handleUsersFromDatabase(result *sql.Rows, err error) ([]*User, *DBError) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no users found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving users from database: %v", err), http.StatusInternalServerError)
	}
	defer result.Close()
	users := make([]*User, 0)
	for result.Next() {
		u := &User{}
		if err = result.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Bio, &u.PassHash,
			&u.RoleID, &u.Active, &u.CreatedAt); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into role: %v", err), http.StatusInternalServerError)
		}
		users = append(users, u)
	}
	return users, nil
}
