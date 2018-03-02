package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
)

func receive(r *http.Request, v interface{}) error {
	// content-type must be JSON
	contentType := r.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, constants.ContentTypeJSON) {
		return fmt.Errorf("`%s` is not a supported Content-Type; must be `%s`", contentType, constants.ContentTypeJSONUTF8)
	}

	// decode the request body into v
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(v); err != nil {
		return fmt.Errorf("error decoding JSON: %v", err)
	}
	return nil
}
