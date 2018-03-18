package handlers

import "net/http"

func IndexHandler(entryPoint string) func(w http.ResponseWriter, r *http.Request) {
	fn := func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, entryPoint)
	}
	return http.HandlerFunc(fn)
}
