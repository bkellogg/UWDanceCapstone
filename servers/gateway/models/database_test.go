package models

import (
	"database/sql"
	"fmt"
	_ "github.com/go-sql-driver/mysql"
	"os"
	"testing"
)

func TestInsertNewUser(t *testing.T) {
	db, err := NewDatabase("root", os.Getenv("MYSQLPASS"), "127.0.0.1:3306", os.Getenv("MYSQLDBNAME"))
	if err != nil {
		t.Fatalf("error opening connection to database: %s", err)
	}

	cases := []struct {
		Name string
		User *User
	}{
		{
			Name: "insert random user 1",
			User: generateRandomUser(),
		},
		{
			Name: "insert random user 2",
			User: generateRandomUser(),
		},
		{
			Name: "insert random user 3",
			User: generateRandomUser(),
		},
	}

	for _, c := range cases {
		if err := db.InsertNewUser(c.User); err != nil {
			t.Fatalf("%s failed with error %v", c.Name, err)
		}
	}
}

func TestGetUserByUserName(t *testing.T) {
	db, err := NewDatabase("root", os.Getenv("MYSQLPASS"), "127.0.0.1:3306", os.Getenv("MYSQLDBNAME"))
	if err != nil {
		t.Fatalf("error opening connection to database: %s", err)
	}

	cases := []struct {
		Name                 string
		User                 *User
		ExpectError          bool
		ForceInvalidUserName bool
	}{
		{
			Name:                 "get random user by username 1",
			User:                 generateRandomUser(),
			ExpectError:          false,
			ForceInvalidUserName: false,
		},
		{
			Name:                 "get random user by username 2",
			User:                 generateRandomUser(),
			ExpectError:          false,
			ForceInvalidUserName: false,
		},
		{
			Name:                 "get random user by username 3",
			User:                 generateRandomUser(),
			ExpectError:          false,
			ForceInvalidUserName: false,
		},
		{
			Name:                 "get random non existent user by username 1",
			User:                 generateRandomUser(),
			ExpectError:          true,
			ForceInvalidUserName: true,
		},
		{
			Name:                 "get random non existent user by username 2",
			User:                 generateRandomUser(),
			ExpectError:          true,
			ForceInvalidUserName: true,
		},
		{
			Name:                 "get random non existent user by username 3",
			User:                 generateRandomUser(),
			ExpectError:          true,
			ForceInvalidUserName: true,
		},
	}

	for _, c := range cases {
		if err := db.InsertNewUser(c.User); err != nil {
			t.Fatalf("%s failed with error %v", c.Name, err)
		}

		username := c.User.UserName
		if c.ForceInvalidUserName {
			username = username + "--invalid"
		}

		user, err := db.GetUserByUserName(username)
		if err != nil && !c.ExpectError {
			t.Fatalf("%s failed with error %v", c.Name, err)
		} else if err == nil && c.ExpectError {
			t.Fatalf("5s failed. expected an error and got none", c.Name)
		} else if c.ForceInvalidUserName {
			if err != sql.ErrNoRows {
				t.Fatalf("%s failed. expected %v, but got $v", c.Name, sql.ErrNoRows, err)
			}
			continue
		}

		if err = compareUsers(user, c.User); err != nil {
			t.Fatalf("%s failed with error: %v", c.Name, err)
		}
	}
}

func TestGetUserByEmail(t *testing.T) {
	db, err := NewDatabase("root", os.Getenv("MYSQLPASS"), "127.0.0.1:3306", os.Getenv("MYSQLDBNAME"))
	if err != nil {
		t.Fatalf("error opening connection to database: %s", err)
	}

	cases := []struct {
		Name         string
		User         *User
		ExpectError  bool
		ForceInvalid bool
	}{
		{
			Name:         "get random user by email 1",
			User:         generateRandomUser(),
			ExpectError:  false,
			ForceInvalid: false,
		},
		{
			Name:         "get random user by email 2",
			User:         generateRandomUser(),
			ExpectError:  false,
			ForceInvalid: false,
		},
		{
			Name:         "get random user by email 3",
			User:         generateRandomUser(),
			ExpectError:  false,
			ForceInvalid: false,
		},
		{
			Name:         "get random non existent user by email 1",
			User:         generateRandomUser(),
			ExpectError:  true,
			ForceInvalid: true,
		},
		{
			Name:         "get random non existent user by email 2",
			User:         generateRandomUser(),
			ExpectError:  true,
			ForceInvalid: true,
		},
		{
			Name:         "get random non existent user by email 3",
			User:         generateRandomUser(),
			ExpectError:  true,
			ForceInvalid: true,
		},
	}

	for _, c := range cases {
		if err := db.InsertNewUser(c.User); err != nil {
			t.Fatalf("%s failed with error %v", c.Name, err)
		}

		email := c.User.Email
		if c.ForceInvalid {
			email = email + "--invalid"
		}

		user, err := db.GetUserByEmail(email)
		if err != nil && !c.ExpectError {
			t.Fatalf("%s failed with error %v", c.Name, err)
		} else if err == nil && c.ExpectError {
			t.Fatalf("5s failed. expected an error and got none", c.Name)
		} else if c.ForceInvalid {
			if err != sql.ErrNoRows {
				t.Fatalf("%s failed. expected %v, but got $v", c.Name, sql.ErrNoRows, err)
			}
			continue
		}
		if err = compareUsers(user, c.User); err != nil {
			t.Fatalf("%s failed with error: %v", c.Name, err)
		}
	}
}

// comapres user1 and user2 for equality
func compareUsers(user1, user2 *User) error {
	if user1.UserName != user2.UserName {
		return fmt.Errorf("inserted and retrieved usernames did not match")
	}
	if user1.FirstName != user2.FirstName {
		return fmt.Errorf("inserted and retrieved firstnames did not match")
	}
	if user1.LastName != user2.LastName {
		return fmt.Errorf("inserted and retrieved lastnames did not match")
	}
	if user1.Email != user2.Email {
		return fmt.Errorf("inserted and retrieved emails did not match")
	}
	if user1.Role != user2.Role {
		return fmt.Errorf("inserted and retrieved roles did not match")
	}
	return nil
}
