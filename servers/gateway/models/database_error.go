package models

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"

// DBError represents an error that is returned
// from a database function.
type DBError struct {
	Message    string
	HTTPStatus int
}

// NewDBError returns a new DBError from the given
// message and status.
func NewDBError(message string, status int) *DBError {
	return &DBError{
		Message:    message,
		HTTPStatus: status,
	}
}

// ToHTTPError returns the current DBError as an
// HTTPError.
func (dbe *DBError) ToHTTPError() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: dbe.Message,
		Status:  dbe.HTTPStatus,
	}
}

// ToHTTPErrorContext returns the current DBError as an
// HTTPError with the additional context provided.
func (dbe *DBError) ToHTTPErrorContext(context string) *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: context + ": " + dbe.Message,
		Status:  dbe.HTTPStatus,
	}
}
