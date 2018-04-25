package middleware

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
	"github.com/gorilla/mux"
)

type AuthenticatedRouter struct {
	*mux.Router
	key   string
	store sessions.Store
}

func NewAuthenticatedRouter(key string, store sessions.Store) *AuthenticatedRouter {
	return &AuthenticatedRouter{Router: mux.NewRouter(), key: key, store: store}
}

func (ar *AuthenticatedRouter) HandleAuth(pattern string, handler authenticatedHandler) *mux.Route {
	return ar.HandleFunc(pattern, func(w http.ResponseWriter, r *http.Request) {
		user, err := sessions.GetUserFromRequest(r, ar.key, ar.store)
		if err != nil {
			http.Error(w, "you must be signed in to use this resource", http.StatusUnauthorized)
			return
		}
		if httperr := handler(w, r, user); httperr != nil {
			http.Error(w, httperr.Message, httperr.Status)
			return
		}
	})
}
