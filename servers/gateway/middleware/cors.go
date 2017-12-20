package middleware

import "net/http"
import "github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"

// CORSHandler defines a handler that can have CORS added to it
type CORSHandler struct {
	handler http.Handler
}

// NewCORSHandler returns a CORSHandler from the given handler.
func NewCORSHandler(handler http.Handler) *CORSHandler {
	return &CORSHandler{handler: handler}
}

// ServeHTTP adds the CORS headers to this CORSHandler and processes the request as normal.
func (ch *CORSHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Add(constants.HeaderAccessControlAllowOrigin, constants.CORSAllowedOrigins)
	w.Header().Add(constants.HeaderAccessControlAllowMethods, constants.CORSAllowedMethods)
	w.Header().Add(constants.HeaderAccessControlAllowHeaders, constants.CORSAllowedHeaders)
	w.Header().Add(constants.HeaderAccessControlExposeHeaders, constants.CORSExposedHeaders)

	// Process the original request.
	ch.handler.ServeHTTP(w, r)
}
