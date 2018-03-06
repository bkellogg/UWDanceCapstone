package middleware

import (
	"net/http"
	"strings"
)

// IEBlocker is a handler wrapper that blocks requests
// received with the IE User Agent.
type IEBlocker struct {
	handler http.Handler
}

// BlockIE returns a wrapped handler that blocks requests
// received with the IE User Agent
func BlockIE(handler http.Handler) *IEBlocker {
	return &IEBlocker{handler: handler}
}

// ServeHTTP serves the IE Blocked handler's http if and only if
// the request was not made with the IE User-Agent
func (ieb *IEBlocker) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if strings.Contains(r.Header.Get("User-Agent"), "Trident") {
		http.Error(w, "this site does not function with internet explorer; please use a modern internet browser", http.StatusBadRequest)
		return
	}
	ieb.handler.ServeHTTP(w, r)
}
