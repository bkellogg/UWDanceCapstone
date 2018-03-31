package middleware

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/models"

// HTTPError defines an error return type used for some
// types of handlers
type HTTPError struct {
	Message string
	Status  int
}

// NewHTTPError returns a populated HTTPError
func NewHTTPError(message string, status int) *HTTPError {
	return &HTTPError{
		Message: message,
		Status:  status,
	}
}

// HTTPErrorFromDBError returns the given DBError as an
// HTTPError.
func HTTPErrorFromDBError(dbe *models.DBError) *HTTPError {
	return &HTTPError{
		Message: dbe.Message,
		Status:  dbe.HTTPStatus,
	}
}

// ToHTTPErrorContext returns the current DBError as an
// HTTPError with the additional context provided.
func HTTPErrorFromDBErrorContext(dbe *models.DBError, context string) *HTTPError {
	return &HTTPError{
		Message: context + ": " + dbe.Message,
		Status:  dbe.HTTPStatus,
	}
}
