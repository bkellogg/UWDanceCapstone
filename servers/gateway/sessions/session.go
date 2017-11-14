package sessions

import (
	"errors"
	"net/http"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

const headerAuthorization = "Authorization"
const paramAuthorization = "auth"
const schemeBearer = "Bearer "

//ErrNoSessionID is used when no session ID was found in the Authorization header
var ErrNoSessionID = errors.New("no session ID found in " + headerAuthorization + " header")

//ErrInvalidScheme is used when the authorization scheme is not supported
var ErrInvalidScheme = errors.New("authorization scheme not supported")

//BeginSession creates a new SessionID, saves the `sessionState` to the store, adds an
//Authorization header to the response with the SessionID, and returns the new SessionID
func BeginSession(signingKey string, store Store, sessionState interface{}, w http.ResponseWriter) (SessionID, error) {
	sessionID, err := NewSessionID(signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	err = store.Save(sessionID, sessionState)
	if err != nil {
		return InvalidSessionID, err
	}
	w.Header().Add(headerAuthorization, schemeBearer+sessionID.String())

	return sessionID, nil
}

//GetSessionID extracts and validates the SessionID from the request headers
func GetSessionID(r *http.Request, signingKey string) (SessionID, error) {
	authHeader := r.Header.Get(headerAuthorization)
	if len(authHeader) == 0 {
		if authHeader = r.URL.Query().Get(paramAuthorization); len(authHeader) == 0 {
			return InvalidSessionID, ErrNoSessionID
		}
	}
	if strings.HasPrefix(authHeader, schemeBearer) {
		authHeader = strings.TrimPrefix(authHeader, schemeBearer)
	} else {
		return InvalidSessionID, ErrInvalidScheme
	}

	sessionID, err := ValidateID(authHeader, signingKey)
	if err != nil {
		return InvalidSessionID, ErrInvalidID
	}
	return sessionID, nil
}

//GetState extracts the SessionID from the request,
//gets the associated state from the provided store into
//the `sessionState` parameter, and returns the SessionID
func GetState(r *http.Request, signingKey string, store Store, sessionState interface{}) (SessionID, error) {
	sessionID, err := GetSessionID(r, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	err = store.Get(sessionID, &sessionState)
	if err != nil {
		return InvalidSessionID, err
	}
	return sessionID, nil
}

//EndSession extracts the SessionID from the request,
//and deletes the associated data in the provided store, returning
//the extracted SessionID.
func EndSession(r *http.Request, signingKey string, store Store) (SessionID, error) {
	sessionID, err := GetSessionID(r, signingKey)
	if err != nil {
		return InvalidSessionID, err
	}
	err = store.Delete(sessionID)
	if err != nil {
		return InvalidSessionID, err
	}
	return sessionID, nil
}

// Gets the User from the given request. Returns an error if there was an error
// getting the user
func GetUserFromRequest(r *http.Request, signingKey string, store Store) (*models.User, error) {
	state := &SessionState{}
	if _, err := GetState(r, signingKey, store, state); err != nil {
		return nil, err
	}
	return state.User, nil
}
