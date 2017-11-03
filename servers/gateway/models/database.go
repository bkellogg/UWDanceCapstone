package models

import "database/sql"
import (
	"errors"
	"github.com/go-sql-driver/mysql"
	"strconv"
)

// Database defines a sql database struct
type Database struct {
	DB *sql.DB
}

// NewDatabase returns a new Database with an open sql DB connection from the given
// connection information. Returns an error if it failed to open the connection, or
// if it fails to ping the DB after three tries
func NewDatabase(user, password, addr, dbName string) (*Database, error) {
	connectionInfo := mysql.Config{
		User:      user,
		Passwd:    password,
		Addr:      addr,
		DBName:    dbName,
		ParseTime: true,
	}
	db, err := sql.Open("mysql", connectionInfo.FormatDSN())
	if err != nil {
		return nil, errors.New("error opening connection to Database: " + err.Error())
	}
	return &Database{DB: db}, nil
}

// ContainsUser returns true if this database contains a user with the same
// email as the given newUser object. Returns an error if one occurred
func (store *Database) ContainsUser(newUser *NewUserRequest) (bool, error) {
	user, err := store.GetUserByEmail(newUser.Email)
	if user != nil {
		return true, nil
	}
	return false, err
}

// InsertNewUser inserts the given new user into the store
// and populates the ID field of the user
func (store *Database) InsertNewUser(user *User) error {
	// TODO: Replace this with stored procedure

	result, err := store.DB.Exec(`INSERT INTO Users (FirstName, LastName, Email, PassHash, Role) VALUES (?, ?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, user.PassHash, user.Role)
	if err != nil {
		return err
	}
	user.ID, _ = result.LastInsertId()
	return nil
}

// GetUserByID gets the user with the given id, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByID(id int) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(`SELECT * FROM Users U WHERE U.UserID = `+strconv.Itoa(id)).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
	if err != nil {
		user = nil
	}
	return user, err
}

// GetUserByEmail gets the user with the given email, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByEmail(email string) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(`SELECT * FROM Users WHERE Users.Email =?`, email).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
	if err != nil {
		user = nil
	}
	return user, err
}

// UpdateUserByID updates the user with the given ID to match the values
// of newValues. Returns an error if one occured.
// TODO: Implement and test this
func (store *Database) UpdateUserByID(userID int, newValues *User) error {
	return nil
}

// DeactivateUserByID marks the user with the given userID as deleted. Returns
// an error if one occured.
// TODO: Implement and test this
func (store *Database) DeactivateUserByID(userID int) error {
	return nil
}
