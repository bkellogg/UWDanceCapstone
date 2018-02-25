package handlers

import (
	"net/http"
	"regexp"
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

// AddTrailingSlash redirects the request with an additional / if it does not
// have one. If the request URL already has a / when it calls the given handlers
// ServeHTTP method.
func AddTrailingSlash(h http.Handler) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		tempPath := r.URL.Path
		slashIndex := strings.LastIndex(tempPath, "/")
		if slashIndex <= 0 {
			http.Redirect(w, r, r.URL.Path+"/", http.StatusPermanentRedirect)
		} else {
			tempPath = tempPath[slashIndex:]
		}
		if match, err := regexp.MatchString("/.*", tempPath); match {
			h.ServeHTTP(w, r)
			return
		} else if err != nil {
			http.Error(w, "redirecting failed", http.StatusInternalServerError)
			return
		}
		http.Redirect(w, r, r.URL.Path+"/", http.StatusPermanentRedirect)
	})
}
