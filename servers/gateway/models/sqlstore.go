package models

import (
	"database/sql"
	"errors"
	"log"

	"github.com/go-sql-driver/mysql"
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
		Net:       "tcp",
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

// LogError logs the given error to the database.
func (store *Database) LogError(err ErrorLog) {
	_, dbErr := store.DB.Exec(`INSERT INTO Errors (ErrTime, ErrRemoteAddr, ErrRequestMethod, ErrRequestURI, ErrCode, ErrMessage) VALUES (?, ?, ?, ?, ?, ?)`,
		err.Time, err.RemoteAddr, err.RequestMethod, err.RequestURI, err.Code, err.Message)
	if dbErr != nil {
		log.Println("logging failed: " + dbErr.Error())
	}
}
