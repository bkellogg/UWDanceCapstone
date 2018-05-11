package handlers

import (
	"net/http"
	"path"
)

// IndexHandler handles the serving the webclient from the root resource.
func IndexHandler(basePath string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		file := path.Base(r.URL.Path)
		http.ServeFile(w, r, basePath+file)
	}
	return http.HandlerFunc(fn)
}
