package handlers

import (
	"net/http"

	"fmt"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
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
	if err := recieve(r, newUser); err != nil {
		http.Error(w, "error decoding request: "+err.Error(), http.StatusBadRequest)
		return
	}

	userAlreadyExists, err := ctx.Database.ContainsUser(newUser)
	if err != nil {
		http.Error(w, "error looking up user in database: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if userAlreadyExists {
		http.Error(w, "user already exists with that email", http.StatusBadRequest)
		return
	}

	user, err := newUser.ToUser()
	if err != nil {
		http.Error(w, "error validating user: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err = ctx.Database.InsertNewUser(user); err != nil {
		http.Error(w, "error inserting user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	state := sessions.NewSessionState(user)
	if _, err = sessions.BeginSession(ctx.SessionKey, ctx.SessionsStore, state, w); err != nil {
		http.Error(w, "error beginning session: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err = respond(w, user, http.StatusCreated); err != nil {
		http.Error(w, "error responding with user: "+err.Error(), http.StatusBadRequest)
		return
	}

}

// UserSignInHandler handles requests for user sign ins
func (ctx *AuthContext) UserSignInHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "requests to /api/v1/sessions must be POST", http.StatusMethodNotAllowed)
		return
	}
	signInRequest := &models.SignInRequest{}
	if err := recieve(r, signInRequest); err != nil {
		http.Error(w, "error decoding request: "+err.Error(), http.StatusBadRequest)
		return
	}

	// Get the user from the database corresponding to the given email
	user, err := ctx.Database.GetUserByEmail(signInRequest.Email)
	if err != nil {
		http.Error(w, "error performing database lookup: "+err.Error(), http.StatusInternalServerError)
		return
	}
	if user == nil {
		dummyAuthenticate()
		http.Error(w, "invalid credentials", http.StatusUnauthorized)
		return
	}

	// Compare the passwords to check if they match. If they do, then the sign in is valid
	// If they don't, then reject the signin request.
	if err = user.Authenticate(signInRequest.Password); err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
	}

	state := sessions.NewSessionState(user)
	if _, err = sessions.BeginSession(ctx.SessionKey, ctx.SessionsStore, state, w); err != nil {
		http.Error(w, "error beginning session: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err = respond(w, user, http.StatusOK); err != nil {
		http.Error(w, "error responding with user: "+err.Error(), http.StatusBadRequest)
		return
	}
}

// performs a dummy authentication to mimic a real authentication to
// prevent timing attacks
func dummyAuthenticate() {
	fmt.Println("dummy auth called")
	hash, _ := bcrypt.GenerateFromPassword([]byte("DUMMYAUTHENTICATE"), constants.BCryptDefaultCost)
	bcrypt.CompareHashAndPassword(hash, []byte("WRONGPASSWORD"))
}
