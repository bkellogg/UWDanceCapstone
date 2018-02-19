package handlers

import (
	"net/http"
	"strings"
)

// PreventDirListing returns a HandlerFunc on the given handler that
// prevents the root directory from being listed. That is, for a static
// file server a specific file will need to be supplied.
func PreventDirListing(h http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if strings.HasSuffix(r.URL.Path, "/") {
			http.NotFound(w, r)
			return
		}
		h.ServeHTTP(w, r)
	})
}
