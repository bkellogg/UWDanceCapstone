package models

import (
	"database/sql"
	"errors"
	"strconv"
	"strings"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
)

// UserIsInPiece returns true if the given user is in the given piece or an error if one occured.
func (store *Database) UserIsInPiece(userID, pieceID int) (bool, error) {
	result, err := store.db.Query(`SELECT * FROM UserPiece UP WHERE UP.UserID = ? AND UP.PieceID = ? AND UP.IsDeleted = ?`,
		userID, pieceID, false)
	if result == nil {
		return false, err
	}
	return result.Next(), nil
}

// AddUserToPiece adds the given user to the given piece.
func (store *Database) AddUserToPiece(userID, pieceID int) error {
	addTime := time.Now()
	exists, err := store.UserIsInPiece(userID, pieceID)
	if err != nil {
		return err
	}
	if exists {
		return errors.New("user is already in this piece")
	}
	_, err = store.db.Exec(`INSERT INTO UserPiece (UserID, PieceID, CreatedAt, IsDeleted) VALUES (?, ?, ?, ?)`,
		userID, pieceID, addTime, false)
	return err
}

// RemoveUserFromPiece removes the given user from the given piece.
func (store *Database) RemoveUserFromPiece(userID, pieceID int) error {
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

// GetAllUsers returns a slice of users of every user in the database, active or not.
// Returns an error if one occured
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
	// TODO: Replace this with stored procedure
	result, err := store.db.Exec(
		`INSERT INTO Users (FirstName, LastName, Email, PassHash, Role, Active, CreatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, user.PassHash, user.Role, constants.UserActive, user.CreatedAt)
	if err != nil {
		return err
	}
	user.ID, _ = result.LastInsertId()
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
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role, &user.Active, &user.CreatedAt)
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
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role, &user.Active, &user.CreatedAt)
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
// TODO: Implement and test this
func (store *Database) UpdateUserByID(userID int, updates *UserUpdates) error {
	shouldUpdateFirstName := len(updates.FirstName) > 0
	shouldUpdateLastName := len(updates.LastName) > 0
	shouldUpdateBio := len(updates.Bio) > 0

	// do not build update query if there are no updates to be made
	if !(shouldUpdateFirstName || shouldUpdateLastName || shouldUpdateBio) {
		return nil
	}
	query := `UPDATE Users U SET`
	if shouldUpdateFirstName {
		query += ` U.FirstName = ?,`
	}
	if shouldUpdateLastName {
		query += ` U.LastName = ?,`
	}
	if shouldUpdateBio {
		query += ` U.Bio = ?`
	}
	query = strings.TrimSuffix(query, ",")
	query += ` WHERE U.UserID = ?`
	_, err := store.db.Exec(query)
	return err
}

// DeactivateUserByID marks the user with the given userID as inactive. Returns
// an error if one occured.
// TODO: Implement and test this
func (store *Database) DeactivateUserByID(userID int) error {
	result, err := store.db.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, constants.UserInactive, userID)
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
	_, err := store.db.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, constants.UserActive, userID)
	return err
}

// TODO: Modularize these GetUsersByX functions...

// GetUsersByAuditionID returns a slice of users that are in the given audition, if any.
// Returns an error if one occured.
func (store *Database) GetUsersByAuditionID(id, page int, includeDeleted bool) ([]*User, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.PassHash, U.Role, U.Active, U.CreatedAt FROM Users U
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
// Returns an error if one occured.
func (store *Database) GetUsersByShowID(id, page int, includeDeleted bool) ([]*User, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.PassHash, U.Role, U.Active, U.CreatedAt FROM Users U
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
// Returns an error if one occured.
func (store *Database) GetUsersByPieceID(id, page int, includeDeleted bool) ([]*User, error) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT U.UserID, U.FirstName, U.LastName, U.Email, U.PassHash, U.Role, U.Active, U.CreatedAt FROM Users U
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

// handleUsersFromDatabase compiles the given result and err into a slice of users or an error.
func handleUsersFromDatabase(result *sql.Rows, err error) ([]*User, error) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	users := make([]*User, 0)
	for result.Next() {
		u := &User{}
		if err = result.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.PassHash,
			&u.Role, &u.Active, &u.CreatedAt); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}
