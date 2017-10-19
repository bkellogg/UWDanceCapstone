package models

import "database/sql"
import (
	"errors"
	"fmt"
	"strconv"
	"time"
)

// Database defines a sql database struct
type Database struct {
	DB *sql.DB
}

// NewDatabase returns a populated database struct from
// the given sql.DB pointer
func NewDatabase(user, password, addr, dbName string) (*Database, error) {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, addr, dbName))
	if err != nil {
		return nil, errors.New("error opening connection to Database: " + err.Error())
	}
	if err = db.Ping(); err != nil {
		fmt.Println("unable to ping database...will attempt 3 more times.")
		for i := 3; i > 0; i-- {
			time.Sleep(time.Second * 3)
			if err = db.Ping(); err != nil {
				fmt.Println("unable to ping database...will attempt " + strconv.Itoa(i) + " more times.")
			} else {
				break
			}
			return nil, err
		}
	}
	return &Database{DB: db}, nil
}

// ContainsUser returns true if this database contains a user with the same username
// or email as the given newUser object. Returns an error if one occurred
func (store *Database) ContainsUser(newUser *NewUserRequest) (bool, error) {
	user, err := store.GetUserByUserName(newUser.UserName)
	if err != nil {
		return false, err
	}
	if user != nil {
		return true, errors.New("user already exists with that username")
	}
	user, err = store.GetUserByEmail(newUser.Email)
	if err != nil {
		return false, err
	}
	if user != nil {
		return true, errors.New("user already exists with that email")
	}
	return false, nil
}

// InsertNewUser inserts the given new user into the store
func (store *Database) InsertNewUser(user *User) error {
	// TODO: Replace this with stored procedure
	_, err := store.DB.Exec(`INSERT INTO Users (UserName, FirstName, LastName, Email, PassHash, Role) VALUES (` +
		`'` + user.UserName + `', '` + user.FirstName + `', '` + user.LastName + `', '` + user.Email + `', '` + string(user.PassHash) + `', '` + string(user.Role) + `')`)
	return err
}

// GetUserByID gets the user with the given id, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByID(id int) (*User, error) {
	result := store.DB.QueryRow(`SELECT * FROM Users U WHERE U.UserID = ` + strconv.Itoa(id))
	user := &User{}
	if err := result.Scan(user); err != nil {
		return nil, err
	}
	return user, nil
}

// GetUserByUserName gets the user with the given username, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByUserName(username string) (*User, error) {
	user := &User{}
	err := store.DB.QueryRow(`SELECT * FROM Users WHERE Users.UserName =?`, username).Scan(
		&user.ID, &user.UserName, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
	if err != nil {
		return nil, err
	}
	return user, nil
}

// GetUserByEmail gets the user with the given email, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByEmail(email string) (*User, error) {
	user := &User{}
	err := store.DB.QueryRow(`SELECT * FROM Users WHERE Users.Email =?`, email).Scan(
		&user.ID, &user.UserName, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
	if err != nil {
		return nil, err
	}
	return user, nil
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
