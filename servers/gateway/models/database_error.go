package models

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
