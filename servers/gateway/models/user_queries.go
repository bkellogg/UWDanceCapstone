package models

import (
	"database/sql"
	"errors"
	"strconv"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// UserIsInPiece returns true if the given user is in the given piece or an error if one occurred.
func (store *Database) UserIsInPiece(userID, pieceID int) (bool, error) {
	result, err := store.db.Query(`SELECT * FROM UserPiece UP WHERE UP.UserID = ? AND UP.PieceID = ? AND UP.IsDeleted = ?`,
		userID, pieceID, false)
	if result == nil {
		return false, err
	}
	defer result.Close()
	returnVal := result.Next()
	return returnVal, nil
}

// UserIsInAudition returns true if the given user is in the given audition or an error if one occurred.
func (store *Database) UserIsInAudition(userID, audID int) (bool, error) {
	result, err := store.db.Query(`SELECT * FROM UserAudition UP WHERE UP.UserID = ? AND UP.AuditionID = ? AND UP.IsDeleted = ?`,
		userID, audID, false)
	if result == nil {
		return false, err
	}
	defer result.Close()
	return result.Next(), nil
}

// AddUserToPiece adds the given user to the given piece.
func (store *Database) AddUserToPiece(userID, pieceID int, role string) error {
	piece, err := store.GetPieceByID(pieceID, false)
	if err != nil {
		return err
	}
	if piece == nil {
		return errors.New(appvars.ErrPieceDoesNotExist)
	}
	addTime := time.Now()
	exists, err := store.UserIsInPiece(userID, pieceID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("user is already in this piece")
	}
	_, err = store.db.Exec(`INSERT INTO UserPiece (UserID, PieceID, RoleID, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
		userID, pieceID, role, addTime, false)
	return err
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
		err = rows.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level)
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

	res, err := tx.Exec(`UPDATE Users U SET U.RoleID = ? WHERE U.UserID = ?`, role.ID, userID)
	if err != nil {
		tx.Rollback()
		return errors.New("error updating user: " + err.Error())
	}

	numRows, err := res.RowsAffected()
	if err != nil {
		tx.Rollback()
		return errors.New("error getting number of rows affected: " + err.Error())
	}

	if numRows != 1 {
		tx.Rollback()
		return errors.New("unexpected number of rows affected; transaction not saved")
	}

	if err = tx.Commit(); err != nil {
		return errors.New("error committing transaction: " + err.Error())
	}
	return nil
}

// RemoveUserFromPiece removes the given user from the given piece.
func (store *Database) RemoveUserFromPiece(userID, pieceID int) error {
	piece, err := store.GetPieceByID(pieceID, false)
	if err != nil {
		return err
	}
	if piece == nil {
		return errors.New("piece does not exist")
	}
	result, err := store.db.Exec(`UPDATE UserPiece UP SET UP.IsDeleted = ? WHERE UP.UserID = ? AND UP.PieceID = ?`,
		true, userID, pieceID)
	if err == nil {
		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			return sql.ErrNoRows
		}
	}
	return err
}

// AddUserToAudition adds the given user to the given audition. Returns an error
// if one occurred.
func (store *Database) AddUserToAudition(userID, audID, creatorID int, availability *WeekTimeBlock, comment string) error {
	audition, dberr := store.GetAuditionByID(audID, false)
	if dberr != nil {
		return errors.New(dberr.Message)
	}
	if audition == nil {
		return errors.New(appvars.ErrAuditionDoesNotExist)
	}
	addTime := time.Now()
	exists, err := store.UserIsInAudition(userID, audID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New(appvars.ErrUserAlreadyInAudition)
	}

	dayMap, err := availability.ToSerializedDayMap()
	if err != nil {
		return err
	}

	tx, err := store.db.Begin()
	if err != nil {
		return errors.New("error beginning DB transaction: " + err.Error())
	}
	res, err := tx.Exec(`INSERT INTO UserAuditionAvailability
		(Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		dayMap["sun"], dayMap["mon"], dayMap["tues"], dayMap["wed"], dayMap["thurs"], dayMap["fri"], dayMap["sat"], addTime, false)
	if err != nil {
		tx.Rollback()
		return errors.New("error inserting user audition availability: " + err.Error())
	}
	availID, err := res.LastInsertId()
	if err != nil {
		tx.Rollback()
		return errors.New("error getting insert ID of new availability: " + err.Error())
	}
	res, err = tx.Exec(`INSERT INTO UserAudition (AuditionID, UserID, AvailabilityID, CreatedBy, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		audID, userID, availID, creatorID, addTime, false)
	if err != nil {
		tx.Rollback()
		return errors.New("error inserting user audition: " + err.Error())
	}
	userAudID, err := res.LastInsertId()
	if err != nil {
		return errors.New("error getting insert ID of new UserAudition: " + err.Error())
	}
	if len(comment) > 0 {
		_, err = tx.Exec(`INSERT INTO UserAuditionComment (UserAuditionID, Comment, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?)`,
			userAudID, comment, addTime, creatorID, false)
		if err != nil {
			tx.Rollback()
			return errors.New("error inserting user audition comment")
		}
	}
	if err = tx.Commit(); err != nil {
		tx.Rollback()
		return errors.New("error committing transaction: " + err.Error())
	}
	return nil
}

// RemoveUserFromPiece removes the given user from the given audition.
func (store *Database) RemoveUserFromAudition(userID, audID int) error {
	audition, dberr := store.GetAuditionByID(audID, false)
	if dberr != nil {
		return errors.New(dberr.Message)
	}
	if audition == nil {
		return errors.New("audition does not exist")
	}
	result, err := store.db.Exec(`UPDATE UserAudition UP SET UP.IsDeleted = ? WHERE UP.UserID = ? AND UP.AuditionID = ?`,
		true, userID, audID)
	if err == nil {
		rowsAffected, _ := result.RowsAffected()
		if rowsAffected == 0 {
			return sql.ErrNoRows
		}
	}
	return err
}

// GetAllUsers returns a slice of users of every user in the database, active or not.
// Returns an error if one occurred
func (store *Database) GetAllUsers(page int, includeInactive bool) ([]*User, error) {
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
func (store *Database) ContainsUser(newUser *NewUserRequest) (bool, error) {
	user, err := store.GetUserByEmail(newUser.Email, true)
	if user != nil {
		return true, nil
	}
	return false, err
}

// InsertNewUser inserts the given new user into the store
// and populates the ID field of the user
func (store *Database) InsertNewUser(user *User) error {
	role, dbErr := store.GetRoleByName(appvars.RoleDancer)
	if dbErr != nil {
		return errors.New(dbErr.Message)
	}
	result, err := store.db.Exec(
		`INSERT INTO Users (FirstName, LastName, Email, Bio, PassHash, RoleID, Active, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, "", user.PassHash, role.ID, true, user.CreatedAt)
	if err != nil {
		return err
	}
	user.ID, _ = result.LastInsertId()
	user.RoleID = int(role.ID)
	return nil
}

// GetUserByID gets the user with the given id, if it exists and it is active.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByID(id int, includeInactive bool) (*User, error) {
	query := `SELECT * FROM Users U WHERE U.UserID =?`
	if !includeInactive {
		query += ` AND U.Active = true`
	}
	user := &User{}
	err := store.db.QueryRow(
		query, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.Bio, &user.PassHash, &user.RoleID, &user.Active, &user.CreatedAt)
	if err != nil {
		user = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return user, err
}

// GetUserByEmail gets the user with the given email, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByEmail(email string, includeInactive bool) (*User, error) {
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
		user = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return user, err
}

// UpdateUserByID updates the user with the given ID to match the values
// of newValues. Returns an error if one occurred.
func (store *Database) UpdateUserByID(userID int, updates *UserUpdates, includeInactive bool) error {
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
		return errors.New("error updating user: " + err.Error())
	}
	return nil
}

// DeactivateUserByID marks the user with the given userID as inactive. Returns
// an error if one occured.
func (store *Database) DeactivateUserByID(userID int) error {
	result, err := store.db.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, false, userID)
	if err != nil {
		return err
	}
	numRows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if numRows == 0 {
		return sql.ErrNoRows
	}
	return err
}

// ActivateUserByID marks the user with the given userID as active. Returns
// an error if one occured.
func (store *Database) ActivateUserByID(userID int) error {
	_, err := store.db.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, true, userID)
	return err
}

// TODO: Modularize these GetUsersByX functions...

// GetUsersByAuditionID returns a slice of users that are in the given audition, if any.
// Returns an error if one occured.
func (store *Database) GetUsersByAuditionID(id, page int, includeDeleted bool) ([]*User, error) {
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
func (store *Database) GetUsersByShowID(id, page int, includeDeleted bool) ([]*User, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.Bio, U.PassHash, U.RoleID, U.Active, U.CreatedAt FROM Users U
	JOIN UserPiece UP On UP.UserID = U.UserID
	JOIN Pieces P ON P.PieceID = UP.PieceID
	WHERE P.ShowID = ?`
	if !includeDeleted {
		query += ` AND UP.IsDeleted = FALSE
		AND P.IsDeleted = FALSE`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handleUsersFromDatabase(store.db.Query(query, id, offset))
}

// GetUsersByPieceID returns a slice of users that are in the given piece, if any.
// Returns an error if one occurred.
func (store *Database) GetUsersByPieceID(id, page int, includeDeleted bool) ([]*User, error) {
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
func handleUsersFromDatabase(result *sql.Rows, err error) ([]*User, error) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	defer result.Close()
	users := make([]*User, 0)
	for result.Next() {
		u := &User{}
		if err = result.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.Bio, &u.PassHash,
			&u.RoleID, &u.Active, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
