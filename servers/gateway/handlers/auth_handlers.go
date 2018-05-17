package handlers

import (
	"fmt"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
	"golang.org/x/crypto/bcrypt"
)

// UserSignUpHandler handles requests for user sign ups
func (ctx *AuthContext) UserSignUpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "requests to /api/v1/users must be POST", http.StatusMethodNotAllowed)
		return
	}
	newUser := &models.NewUserRequest{}
	if err := receive(r, newUser); err != nil {
		http.Error(w, "error decoding request: "+err.Message, err.Status)
		return
	}

	userAlreadyExists, dberr := ctx.store.ContainsUser(newUser)
	if dberr != nil {
		http.Error(w, dberr.Message, dberr.HTTPStatus)
		return
	}
	if userAlreadyExists {
		http.Error(w, "user already exists with that email", http.StatusBadRequest)
		return
	}

	user, err := newUser.ToUser()
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	if dberr = ctx.store.InsertNewUser(user); dberr != nil {
		http.Error(w, "error inserting user: "+dberr.Message, dberr.HTTPStatus)
		return
	}

	state := sessions.NewSessionState(user)
	if _, err = sessions.BeginSession(ctx.SessionKey, ctx.SessionsStore, state, w); err != nil {
		http.Error(w, "error beginning session: "+err.Error(), http.StatusInternalServerError)
		return
	}

	userResponse, err := ctx.permChecker.ConvertUserToUserResponse(user)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}

	respond(w, userResponse, http.StatusCreated)
}

// UserSignInHandler handles requests for user sign ins
func (ctx *AuthContext) UserSignInHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	default:
		http.Error(w, "requests to /api/v1/sessions must be POST", http.StatusMethodNotAllowed)
		return
	case "POST":
		signInRequest := &models.SignInRequest{}
		if err := receive(r, signInRequest); err != nil {
			http.Error(w, "error decoding request: "+err.Message, err.Status)
			return
		}

		// Get the user from the database corresponding to the given email
		user, dberr := ctx.store.GetUserByEmail(signInRequest.Email, true)
		if dberr != nil {
			http.Error(w, "error performing database lookup: "+dberr.Message, dberr.HTTPStatus)
			return
		}
		if user == nil || !user.Active {
			dummyAuthenticate()
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}

		// Compare the passwords to check if they match. If they do, then the sign in is valid
		// If they don't, then reject the signin request.
		if err := user.Authenticate(signInRequest.Password); err != nil {
			http.Error(w, err.Error(), http.StatusUnauthorized)
			return
		}

		state := sessions.NewSessionState(user)
		if _, err := sessions.BeginSession(ctx.SessionKey, ctx.SessionsStore, state, w); err != nil {
			http.Error(w, "error beginning session: "+err.Error(), http.StatusInternalServerError)
			return
		}

		userResponse, err := ctx.permChecker.ConvertUserToUserResponse(user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
		}

		respond(w, userResponse, http.StatusOK)
	case "DELETE":
		_, err := sessions.EndSession(r, ctx.SessionKey, ctx.SessionsStore)
		if err != nil {
			status := http.StatusInternalServerError
			if err == sessions.ErrInvalidScheme ||
				err == sessions.ErrNoSessionID ||
				err == sessions.ErrInvalidID {
				status = http.StatusBadRequest
			} else if err == sessions.ErrStateNotFound {
				status = http.StatusNotFound
			}
			http.Error(w, fmt.Sprintf("error signing out: %v", err), status)
			return
		}
		respondWithString(w, "you have been signed out", http.StatusOK)
	}
}

// performs a dummy authentication to mimic a real authentication to
// prevent timing attacks
func dummyAuthenticate() {
	hash, _ := bcrypt.GenerateFromPassword([]byte("DUMMYAUTHENTICATE"), appvars.BCryptDefaultCost)
	bcrypt.CompareHashAndPassword(hash, []byte("WRONGPASSWORD"))
}
