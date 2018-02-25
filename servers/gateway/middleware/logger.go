package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// loggingResponseWriter defines a wrapper for an http.ResponseWriter
// that saves status code and the message for an http response
type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
	response   string
}

// WriteHeader saves the given status code and writes the status
// code to the wrapped http.ResponseWriter
func (lrw *loggingResponseWriter) WriteHeader(statusCode int) {
	lrw.statusCode = statusCode
	lrw.ResponseWriter.WriteHeader(statusCode)
}

// Write saves the given content []byte slice and writes it
// to the wrapped http.ResponseWriter
func (lrw *loggingResponseWriter) Write(content []byte) (int, error) {
	resBytes := []byte(lrw.response)
	resBytes = append(resBytes, content...)
	lrw.response = string(resBytes)
	return lrw.ResponseWriter.Write(content)
}

// Logger defines the infromation needed for logging middleware
type Logger struct {
	handler http.Handler
	db      *models.Database
}

// LogErrors returns a handler wrapper that will log errors encountered
// while the handler's request was being processed.
func LogErrors(handler http.Handler, db *models.Database) *Logger {
	return &Logger{handler: handler, db: db}
}

// ServeHTTP wraps the Logger's handlers ServeHTTP function and records
// various information about the request
func (l *Logger) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	lrw := &loggingResponseWriter{w, http.StatusOK, ""}
	l.handler.ServeHTTP(lrw, r)
	if lrw.statusCode >= 500 {
		errorCont := models.ErrorLog{
			Code:          lrw.statusCode,
			Message:       strings.TrimSpace(lrw.response),
			RemoteAddr:    r.RemoteAddr,
			RequestMethod: r.Method,
			RequestURI:    r.RequestURI,
			Time:          startTime,
		}
		go l.db.LogError(errorCont)
	}
}
