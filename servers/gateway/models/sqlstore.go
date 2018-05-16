package models

import (
	"database/sql"
	"errors"
	"log"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/go-sql-driver/mysql"
)

// store defines a sql database struct
type Database struct {
	db *sql.DB
}

// NewDatabase returns a new store with an open sql db connection from the given
// connection information. Returns an error if it failed to open the connection, or
// if it fails to ping the db after three tries
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
		return nil, errors.New("error opening connection to store: " + err.Error())
	}
	return &Database{db: db}, nil
}

// BootstrapInitialAdminUser adds an initial admin user with the given information
func (store *Database) BootstrapInitialAdminUser(fName, lName, email, password string) error {
	result, err := store.db.Query(`SELECT * FROM Users U JOIN Role R ON U.RoleID = R.RoleID WHERE R.RoleLevel = 100`)
	if err != nil {
		return errors.New("error looking up current admins: " + err.Error())
	}
	defer result.Close()
	if result.Next() {
		// do nothing since admin users already exist, but don't report an error
		return nil
	}
	user := &User{
		FirstName: fName,
		LastName:  lName,
		Email:     email,
		Active:    true,
		CreatedAt: time.Now(),
	}
	role, dbErr := store.GetRoleByName(appvars.RoleAdmin)
	if dbErr != nil {
		return errors.New("error getting admin role from database: " + dbErr.Message)
	}
	user.RoleID = int(role.ID)
	user.SetPassword(password)
	_, err = store.db.Exec(`INSERT INTO Users
		(FirstName, LastName, Email, Bio, PassHash, RoleID, Active, CreatedAt)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		user.FirstName, user.LastName, user.Email, user.Bio, user.PassHash, role.ID, true, time.Now())
	if err != nil {
		return errors.New("error inserting admin user: " + err.Error())
	}
	return nil
}

// LogError logs the given error to the database.
func (store *Database) LogError(err ErrorLog) {
	_, dbErr := store.db.Exec(`INSERT INTO Errors (ErrTime, ErrRemoteAddr, ErrRequestMethod, ErrRequestURI, ErrCode, ErrMessage) VALUES (?, ?, ?, ?, ?, ?)`,
		err.Time, err.RemoteAddr, err.RequestMethod, err.RequestURI, err.Code, err.Message)
	if dbErr != nil {
		log.Println("logging failed: " + dbErr.Error())
		log.Println(err.Message)
	}
}
