package handlers

import (
	"net/http"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// HTTPSRedirectHandler redirects the given HTTP request to HTTPS.
// Does not redirect requests to any API route.
func HTTPSRedirectHandler(w http.ResponseWriter, r *http.Request) {

	// Tell the browser to use HTTPS in the future.
	w.Header().Add(appvars.HeaderStrictTransportSecurity, appvars.StrictTransportSecurity)

	// Do not redirect requests to any API route as to help stop
	// man in the middle attacks.
	if strings.HasPrefix(r.RequestURI, appvars.BaseAPIPath) {
		http.Error(w, "insecure request rejected: you must use HTTPS for this resource", http.StatusNotFound)
		return
	}

	target := "https://" + r.Host + r.URL.Path
	if len(r.URL.RawQuery) > 0 {
		target += "?" + r.URL.RawQuery
	}
	http.Redirect(w, r, target, http.StatusTemporaryRedirect)
}
