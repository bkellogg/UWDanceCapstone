package handlers

import "net/http"

// IndexHandler handles the serving the webclient from the root resource.
func IndexHandler(entryPoint string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, entryPoint)
	}
	return http.HandlerFunc(fn)
}
