package middleware

import "net/http"
import "github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"

// HeaderAdder defines a handler that can have CORS added to it
type HeaderAdder struct {
	handler http.Handler
}

// NewHeaderAdder returns a CORSHandler from the given handler.
func NewHeaderAdder(handler http.Handler) *HeaderAdder {
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
	ha.handler.ServeHTTP(w, r)
}
