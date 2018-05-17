package middleware

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

// authenticatedHandler defines a function signature that is used for handlers that require
// a request to be authorized before processing.
type authenticatedHandler func(http.ResponseWriter, *http.Request, *models.User) *HTTPError

// HandlerAuthorizer defines a type that authorizes handlers
type HandlerAuthorizer struct {
	signingKey string
	store      sessions.Store
}

// NewHandlerAuthorizer returns a new HandlerAuthorizer from the given information.
func NewHandlerAuthorizer(signingKey string, store sessions.Store) *HandlerAuthorizer {
	return &HandlerAuthorizer{
		signingKey: signingKey,
		store:      store,
	}
}

// Authorize authorizes the provided handler with the current HandlerAuthorizer
func (aw *HandlerAuthorizer) Authorize(handler authenticatedHandler) *AuthorizedHandler {
	return &AuthorizedHandler{
		handler:    handler,
		signingKey: aw.signingKey,
		store:      aw.store,
	}
}

// AuthorizedHandler defines the types of information needed for an AuthorizedHandler.
type AuthorizedHandler struct {
	handler    authenticatedHandler
	signingKey string
	store      sessions.Store
}

func (a *AuthorizedHandler) Middleware(handler http.Handler) http.Handler {
	return a
}

// ServeHTTP serves the request for the authorized handler.
func (a *AuthorizedHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := sessions.GetUserFromRequest(r, a.signingKey, a.store)
	if err != nil {
		http.Error(w, appvars.ErrNotSignedIn, http.StatusUnauthorized)
		return
	}
	if res := a.handler(w, r, user); res != nil {
		http.Error(w, res.Message, res.Status) // if there was an error, write it back to the client
	}

}
