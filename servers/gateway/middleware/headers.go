package middleware

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

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
	// do not allow the auth query string param
	// if the request is not an intended WSS
	// connection.
	if r.URL.Scheme != "wss" {
		r.URL.Query().Del("auth")
	}

	w.Header().Set(appvars.HeaderAccessControlAllowOrigin, appvars.CORSAllowedOrigins)
	w.Header().Set(appvars.HeaderAccessControlAllowMethods, appvars.CORSAllowedMethods)
	w.Header().Set(appvars.HeaderAccessControlAllowHeaders, appvars.CORSAllowedHeaders)
	w.Header().Set(appvars.HeaderAccessControlExposeHeaders, appvars.CORSExposedHeaders)

	w.Header().Set(appvars.HeaderStrictTransportSecurity, appvars.StrictTransportSecurity)

	// Process the original request.
	if r.Method != "OPTIONS" {
		ha.handler.ServeHTTP(w, r)
	}
}
