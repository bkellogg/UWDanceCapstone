package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
)

// respond encodes the given interface v to the given
// http.ResponseWriter. Returns an error if one occured
// nil if otherwise.
func respond(w http.ResponseWriter, v interface{}, statusCode int) error {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeJSONUTF8)
	w.WriteHeader(statusCode)
	encoder := json.NewEncoder(w)
	return encoder.Encode(v)
}

func respondWithString(w http.ResponseWriter, response string, statusCode int) error {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeTextPlainUTF8)
	w.WriteHeader(statusCode)
	_, err := w.Write([]byte(response))
	return err
}
