package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// HTTPError defines a package wrapper for middleware's NewHTTPError
// This is done to prevent needing to specifiy package when creating
// a new error
var HTTPError = middleware.NewHTTPError

// permissionDenied returns a permission deined HTTPError.
func permissionDenied() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: constants.ErrPermissionDenied,
		Status:  http.StatusForbidden,
	}
}

// methodNotAllowed returns a method not allowed HTTPError.
func methodNotAllowed() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: constants.ErrMethodNotAllowed,
		Status:  http.StatusMethodNotAllowed,
	}
}

// objectTypeNotSupported returns an object type not supported HTTPError.
func objectTypeNotSupported() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: constants.ErrObjectTypeNotSupported,
		Status:  http.StatusBadRequest,
	}
}

// resourceDoesNotExist returns a resource does not exists HTTPError.
func resourceDoesNotExist() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: constants.ErrResourceDoesNotExist,
		Status:  http.StatusNotFound,
	}
}

// objectNotFound returns a not found HTTPError for the given type
func objectNotFound(objType string) *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: fmt.Sprintf("no %s found", objType),
		Status:  http.StatusNotFound,
	}
}

// logAndWriteError logs the error content to the given database and writes the error back
// to the client.
func logAndWriteError(w http.ResponseWriter, r *http.Request, message string, code int, db *models.Database) {
	err := models.ErrorLog{
		Time:          time.Now(),
		Code:          code,
		Message:       message,
		RemoteAddr:    r.RemoteAddr,
		RequestURI:    r.RequestURI,
		RequestMethod: r.Method,
	}
	db.LogError(err)
	http.Error(w, message, code)
}
