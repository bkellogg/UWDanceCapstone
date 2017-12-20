package middleware

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
