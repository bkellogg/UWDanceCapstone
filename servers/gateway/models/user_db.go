package models

import (
	"database/sql"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
)

// GetAllUsers returns a slice of users of every user in the database, active or not.
// Returns an error if one occured
func (store *Database) GetAllUsers() ([]*User, error) {
	users := make([]*User, 0)
	result, err := store.DB.Query(`SELECT * FROM Users`)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	for result.Next() {
		u := &User{}
		err = result.Scan(&u.ID, &u.FirstName, &u.LastName, &u.Email, &u.PassHash, &u.Role, &u.Active)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

// ContainsUser returns true if this database contains a user with the same
// email as the given newUser object. Returns an error if one occurred
func (store *Database) ContainsUser(newUser *NewUserRequest) (bool, error) {
	user, err := store.GetUserByEmailIncludeInactive(newUser.Email)
	if user != nil {
		return true, nil
	}
	return false, err
}

// InsertNewUser inserts the given new user into the store
// and populates the ID field of the user
func (store *Database) InsertNewUser(user *User) error {
	// TODO: Replace this with stored procedure
	result, err := store.DB.Exec(`INSERT INTO Users (FirstName, LastName, Email, PassHash, Role, Active) VALUES (?, ?, ?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, user.PassHash, user.Role, constants.UserActive)
	if err != nil {
		return err
	}
	user.ID, _ = result.LastInsertId()
	return nil
}

// GetUserByID gets the user with the given id, if it exists and it is active.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByID(id int) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(
		`SELECT * FROM Users U WHERE U.UserID =? AND U.Active =?`, id, constants.UserActive).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role, &user.Active)
	if err != nil {
		user = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return user, err
}

// GetUserByIDIncludeInactive gets the user with the given id, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByIDIncludeInactive(id int) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(
		`SELECT * FROM Users U WHERE U.UserID =?`, id).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role, &user.Active)
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
func (store *Database) GetUserByEmail(email string) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(
		`SELECT * FROM Users WHERE Users.Email =? AND Users.Active =?`,
		email, constants.UserActive).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role, &user.Active)
	if err != nil {
		user = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return user, err
}

// GetUserByEmailIncludeInactive gets the user with the given email, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByEmailIncludeInactive(email string) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(
		`SELECT * FROM Users WHERE Users.Email =?`,
		email).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role, &user.Active)
	if err != nil {
		user = nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return user, err
}

// UpdateUserByID updates the user with the given ID to match the values
// of newValues. Returns an error if one occured.
// TODO: Implement and test this
func (store *Database) UpdateUserByID(userID int, newValues *User) error {
	return nil
}

// DeactivateUserByID marks the user with the given userID as inactive. Returns
// an error if one occured.
// TODO: Implement and test this
func (store *Database) DeactivateUserByID(userID int) error {
	result, err := store.DB.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, constants.UserInactive, userID)
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
	_, err := store.DB.Exec(`UPDATE Users SET Active = ? WHERE UserID = ?`, constants.UserActive, userID)
	return err
}
