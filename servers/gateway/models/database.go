package models

import "database/sql"

// Database defines a sql database struct
type Database struct {
	DB *sql.DB
}

// NewDatabase returns a populated database struct from
// the given sql.DB pointer
func NewDatabase(db *sql.DB) *Database {
	return &Database{
		DB: db,
	}
}

// InsertNewUser inserts the given new user into the store
func (store *Database) InsertNewUser(user *User) error {
	// TODO: Replace this with stored procedure
	_, err := store.DB.Exec(`INSERT INTO Users (UserName, FirstName, LastName, PassHash, Role) VALUES (` +
		`'` + user.UserName + `', '` + user.FirstName + `', '` + user.LastName + `', '` + string(user.PassHash) + `', '` + string(user.Role) + `')`)
	return err
}

// GetUserByID gets the user with the given id, if it exists.
// returns an error if the lookup failed
func (store *Database) GetUserByID(id int) (*User, error) {
	return nil, nil
}

// GetUserByUserName gets the user with the given username, if it exists.
// returns an error if the lookup failed
func (store *Database) GetUserByUserName(username string) (*User, error) {
	return nil, nil
}

// GetUserByEmail gets the user with the given email, if it exists.
// returns an error if the lookup failed
func (store *Database) GetUserByEmail(email string) (*User, error) {
	return nil, nil
}

// UpdateUserByID updates the user with the given ID to match the values
// of newValues. Returns an error if one occured.
func (store *Database) UpdateUserByID(userID int, newValues *User) error {
	return nil
}

// DeleteUserByID marks the user with the given userID as deleted. Returns
// an error if one occured.
func (store *Database) DeleteUserByID(userID int) error {
	return nil
}
