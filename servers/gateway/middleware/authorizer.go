package middleware

import (
	"encoding/json"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/handlers"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

// Authorizer represents a middleware request authorizer
type Authorizer struct {
	handler http.Handler
	actx    handlers.AuthContext
}

// NewAuthorizer returns a new authorizer with the given handler
func NewAuthorizer(handler http.Handler, actx handlers.AuthContext) *Authorizer {
	return &Authorizer{handler: handler, actx: actx}
}

func (a *Authorizer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	state := &sessions.SessionState{}
	_, err := sessions.GetState(r, a.actx.SessionKey, a.actx.SessionsStore, state)
	if err != nil {
		http.Error(w, "error checking authentication: "+err.Error(), http.StatusBadRequest)
		return
	}
	userJSON, err := json.Marshal(state.User)
	if err != nil {
		http.Error(w, "error marshalling user JSON: "+err.Error(), http.StatusInternalServerError)
		return
	}
	r.Header.Add("X-User", string(userJSON))

	if r.Method != "OPTIONS" {
		a.handler.ServeHTTP(w, r)
	}
}
