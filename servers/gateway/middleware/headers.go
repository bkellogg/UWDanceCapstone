package middleware

import "net/http"
import "github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"

// HeaderAdder defines a handler that can have CORS added to it
type HeaderAdder struct {
	handler http.Handler
}

// EnsureHeaders returns a wrapper for the given handler that will
// add CORS and HSTS headers to the response when the request is processed.
func EnsureHeaders(handler http.Handler) *HeaderAdder {
	return &HeaderAdder{handler: handler}
}

// ServeHTTP adds the CORS headers to this CORSHandler and processes the request as normal.
func (ha *HeaderAdder) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	w.Header().Add(constants.HeaderAccessControlAllowOrigin, constants.CORSAllowedOrigins)
	w.Header().Add(constants.HeaderAccessControlAllowMethods, constants.CORSAllowedMethods)
	w.Header().Add(constants.HeaderAccessControlAllowHeaders, constants.CORSAllowedHeaders)
	w.Header().Add(constants.HeaderAccessControlExposeHeaders, constants.CORSExposedHeaders)

	w.Header().Add(constants.HeaderStrictTransportSecurity, constants.StrictTransportSecurity)

	// Process the original request.
	if r.Method != "OPTIONS" {
		ha.handler.ServeHTTP(w, r)
	}
}
