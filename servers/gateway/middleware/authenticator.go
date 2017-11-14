package middleware

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

type AuthenticatedHandler func(http.ResponseWriter, *http.Request, *models.User)

type Authorizer struct {
	handler    AuthenticatedHandler
	signingKey string
	store      sessions.Store
}

func NewAuthorizer(handler AuthenticatedHandler, signingKey string, store sessions.Store) *Authorizer {
	return &Authorizer{
		handler:    handler,
		signingKey: signingKey,
		store:      store,
	}
}

func (a *Authorizer) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := sessions.GetUserFromRequest(r, a.signingKey, a.store)
	if err != nil {
		http.Error(w, "you must be signed in to use this resource", http.StatusUnauthorized)
		return
	}
	a.handler(w, r, user)
}
