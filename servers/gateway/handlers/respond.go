package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
)

// respond encodes the given interface v to the given
// http.ResponseWriter. Returns an error if one occured
// nil if otherwise.
func respond(w http.ResponseWriter, v interface{}, statusCode int) *middleware.HTTPError {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeJSONUTF8)
	w.WriteHeader(statusCode)
	if err := json.NewEncoder(w).Encode(v); err != nil {
		return HTTPError("error writing to client: "+err.Error(), http.StatusInternalServerError)
	}
	return nil
}

func respondWithString(w http.ResponseWriter, response string, statusCode int) *middleware.HTTPError {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeTextPlainUTF8)
	w.WriteHeader(statusCode)
	if _, err := w.Write([]byte(response)); err != nil {
		return HTTPError("error writing to client: "+err.Error(), http.StatusInternalServerError)
	}
	return nil
}

func respondWithImage(w http.ResponseWriter, image []byte, statusCode int) *middleware.HTTPError {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeImageJPEG)
	w.WriteHeader(statusCode)
	w.Write(image)
	return nil
}

func respondWithPDF(w http.ResponseWriter, pdf []byte, statusCode int) *middleware.HTTPError {
	w.Header().Add(constants.HeaderContentType, constants.ContentTypeApplicationPDF)
	w.WriteHeader(statusCode)
	w.Write(pdf)
	return nil
}
