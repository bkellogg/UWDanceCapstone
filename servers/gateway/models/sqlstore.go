package models

import (
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/go-sql-driver/mysql"
)

// store defines a sql database struct
type Database struct {
	db *sql.DB
	tz *time.Location
}

// NewDatabase returns a new store with an open sql db connection from the given
// connection information. Returns an error if it failed to open the connection, or
// if it fails to ping the db after three tries
func NewDatabase(user, password, addr, dbName, timezone string) (*Database, error) {
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
		return nil, errors.New("error opening connection to store: " + err.Error())
	}
	tz, err := time.LoadLocation(timezone)
	if err != nil {
		return nil, errors.New("error loading timezone: " + err.Error())
	}
	return &Database{db: db, tz: tz}, nil
}

// LogError logs the given error to the database.
func (store *Database) LogError(err ErrorLog) {
	_, dbErr := store.db.Exec(`INSERT INTO Errors (ErrTime, ErrRemoteAddr, ErrRequestMethod, ErrRequestURI, ErrCode, ErrMessage) VALUES (?, ?, ?, ?, ?, ?)`,
		err.Time, err.RemoteAddr, err.RequestMethod, err.RequestURI, err.Code, err.Message)
	if dbErr != nil {
		log.Println("logging failed: " + dbErr.Error())
	}
}
