package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
)

// respond encodes the given interface v to the given
// http.ResponseWriter. Returns an error if one occured
// nil if otherwise.
func respond(w http.ResponseWriter, v interface{}, statusCode int) {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeJSONUTF8)
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		http.Error(w, "error writing to client: "+err.Error(), http.StatusInternalServerError)
	}
}

func respondWithString(w http.ResponseWriter, response string, statusCode int) {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeTextPlainUTF8)
	w.WriteHeader(statusCode)
	if _, err := w.Write([]byte(response)); err != nil {
		http.Error(w, "error writing to client: "+err.Error(), http.StatusInternalServerError)
	}
}
