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

// NewDatabase returns a new Database with an open sql DB connection from the given
// connection information. Returns an error if it failed to open the connection, or
// if it fails to ping the DB after three tries
func NewDatabase(user, password, addr, dbName string) (*Database, error) {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, addr, dbName))
	if err != nil {
		return nil, errors.New("error opening connection to Database: " + err.Error())
	}
	if err = db.Ping(); err != nil {
		fmt.Println("unable to ping database...will attempt 3 more times.")
		// TODO: Fix this broken shit
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
	if user != nil {
		return true, nil
	}
	user, err = store.GetUserByEmail(newUser.Email)
	if user != nil {
		return true, nil
	}
	if err == sql.ErrNoRows {
		err = nil
	}
	return false, err
}

// InsertNewUser inserts the given new user into the store
// and populates the ID field of the user
func (store *Database) InsertNewUser(user *User) error {
	// TODO: Replace this with stored procedure
	//_, err := store.DB.Exec(`INSERT INTO Users (UserName, FirstName, LastName, Email, PassHash, Role) VALUES (` +
	//	`'` + user.UserName + `', '` + user.FirstName + `', '` + user.LastName + `', '` + user.Email + `', '` + string(user.PassHash) + `', '` + string(user.Role) + `')`)

	_, err := store.DB.Exec(`INSERT INTO Users (UserName, FirstName, LastName, Email, PassHash, Role) VALUES (?, ?, ?, ?, ?, ?)`,
		user.UserName, user.FirstName, user.LastName, user.Email, string(user.PassHash), string(user.Role))
	if err != nil {
		return err
	}
	var userID int
	// TODO: This is not a safe way to do this.
	if err = store.DB.QueryRow(`SELECT LAST_INSERT_ID()`).Scan(&userID); err != nil {
		return err
	}
	user.ID = userID
	return nil
}

// GetUserByID gets the user with the given id, if it exists.
// returns an error if the lookup failed
// TODO: Test this
func (store *Database) GetUserByID(id int) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(`SELECT * FROM Users U WHERE U.UserID = `+strconv.Itoa(id)).Scan(
		&user.ID, &user.UserName, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
	if err == sql.ErrNoRows {
		err = nil
	}
	return user, err
}

// GetUserByUserName gets the user with the given username, if it exists.
// returns an error if the lookup failed
func (store *Database) GetUserByUserName(username string) (*User, error) {
	// TODO: Replace with stored procedure
	user := &User{}
	err := store.DB.QueryRow(`SELECT * FROM Users WHERE Users.UserName =?`, username).Scan(
		&user.ID, &user.UserName, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
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
	err := store.DB.QueryRow(`SELECT * FROM Users WHERE Users.Email =?`, email).Scan(
		&user.ID, &user.UserName, &user.FirstName, &user.LastName, &user.Email, &user.PassHash, &user.Role)
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

// DeleteUserByID marks the user with the given userID as deleted. Returns
// an error if one occured.
// TODO: Implement and test this
func (store *Database) DeleteUserByID(userID int) error {
	return nil
}
