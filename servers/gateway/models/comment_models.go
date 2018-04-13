package models

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"time"
)

// AuditionComment defines how a request to create a new audition comment will
// look like. This comment is made with a stand alone request and is not
// tied to the initial UserAudition creation request.
type AuditionComment struct {
	Comment string `json:"comment"`
}

// Validate validates the content of the new audition comment
// and returns an error if one occurred.
func (nac *AuditionComment) Validate() error {
	if len(nac.Comment) == 0 {
		return errors.New("new audition comment must have a comment")
	}
	return nil
}

// UserAuditionComment defines how a comment about a user's audition is stored.
type UserAuditionComment struct {
	ID             int       `json:"id"`
	UserAuditionID int       `json:"uaID"`
	Comment        string    `json:"comment"`
	CreatedAt      time.Time `json:"createdAt"`
	CreatedBy      int       `json:"createdBy"`
	IsDeleted      bool      `json:"isDeleted"`
}

// parseUACommentsFromDatabase compiles the given result and err into a slice of UAComments or an error.
func parseUACommentsFromDatabase(result *sql.Rows, err error) ([]*UserAuditionComment, *DBError) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no comments for this user audition found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving comments for user audition: %v", err), http.StatusInternalServerError)
	}
	defer result.Close()
	comments := make([]*UserAuditionComment, 0)
	for result.Next() {
		c := &UserAuditionComment{}
		if err = result.Scan(&c.ID, &c.UserAuditionID, &c.Comment, &c.CreatedAt, &c.CreatedBy, &c.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into user audition comment: %v", err), http.StatusInternalServerError)
		}
		comments = append(comments, c)
	}
	result.Close()
	return comments, nil
}
