package handlers

import (
	"net/http"
	"os"
	"path"
)

// IndexHandler handles the serving the webclient from the root resource.
func IndexHandler(basePath string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		file := path.Base(r.URL.Path)
		if _, err := os.Stat(basePath + file); err != nil || file == "service-worker.js" {
			file = "index.html"
		}
		http.ServeFile(w, r, basePath+file)
	}
	return fn
}
