package middleware

import (
	"net/http"
	"strings"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

type loggingResponseWriter struct {
	http.ResponseWriter
	statusCode int
	response   string
}

func (lrw *loggingResponseWriter) WriteHeader(statusCode int) {
	lrw.statusCode = statusCode
	lrw.ResponseWriter.WriteHeader(statusCode)
}

func (lrw *loggingResponseWriter) Write(content []byte) (int, error) {
	lrw.response = string(content)
	return lrw.ResponseWriter.Write(content)
}

type Logger struct {
	handler http.Handler
	db      *models.Database
}

func NewLogger(handler http.Handler, db *models.Database) *Logger {
	return &Logger{handler: handler, db: db}
}

func (l *Logger) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	startTime := time.Now()
	lrw := &loggingResponseWriter{w, http.StatusOK, ""}
	l.handler.ServeHTTP(lrw, r)
	if lrw.statusCode >= 400 {
		errorCont := models.ErrorLog{
			Code:          lrw.statusCode,
			Message:       strings.TrimSpace(lrw.response),
			RemoteAddr:    r.RemoteAddr,
			RequestMethod: r.Method,
			RequestURI:    r.RequestURI,
			Time:          startTime,
		}
		l.db.LogError(errorCont)
	}
}
