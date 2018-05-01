package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
)

// receive decodes the given request's body into the given interface
// returns an HTTPError if an error occurred.
func receive(r *http.Request, v interface{}) *middleware.HTTPError {
	// content-type must be JSON
	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, appvars.ContentTypeJSON) {
		return HTTPError(fmt.Sprintf("`%s` is not a supported Content-Type; must be `%s`",
			contentType,
			appvars.ContentTypeJSONUTF8),
			http.StatusBadRequest)
	}

	// decode the request body into v
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(v); err != nil {
		return HTTPError("error processing request: invalid JSON", http.StatusBadRequest)
	}

	// if the request body is a validator, validate it
	if validator, ok := v.(Validator); ok {
		if err := validator.Validate(); err != nil {
			return HTTPError("error validating request: "+err.Error(), http.StatusBadRequest)
		}
	}
	return nil
}
