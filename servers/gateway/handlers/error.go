package handlers

import (
	"net/http"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// HTTPError defines a package wrapper for middleware's NewHTTPError
// This is done to prevent needing to specifiy package when creating
// a new error
var HTTPError = middleware.NewHTTPError

// errPermissionDenied defines the error the client will recieve
// when attempting to access a resource they do not have permission
// to access.
const errPermissionDenied = "you do not have access to this resource"
const errMethodNotAllowed = "current method is not supported on this resource"

// permissionDenied returns a permission deined HTTPError.
func permissionDenied() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: errPermissionDenied,
		Status:  http.StatusForbidden,
	}
}

// methodNotAllowed returns a method not allowed HTTPError.
func methodNotAllowed() *middleware.HTTPError {
	return &middleware.HTTPError{
		Message: errMethodNotAllowed,
		Status:  http.StatusMethodNotAllowed,
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
