package models

import "time"

// ErrorLog defines the information that will be logged with a given
// error
type ErrorLog struct {
	Time          time.Time
	Code          int
	Message       string
	RemoteAddr    string
	RequestURI    string
	RequestMethod string
}
