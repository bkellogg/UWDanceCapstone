package handlers

import (
	"net/http"
	"path"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// IndexHandler handles the serving the webclient from the root resource.
func IndexHandler(basePath string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		file := path.Base(r.URL.Path)
		if file == "service-worker.js" {
			w.Header().Set(appvars.HeaderContentType, "text/plain")
			return
		}
		http.ServeFile(w, r, basePath+file)
	}
	return fn
}
