package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
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

	user, err := newUser.ToUser()
	if err != nil {
		http.Error(w, "error creating user: "+err.Error(), http.StatusBadRequest)
		return
	}

	if err = ctx.DB.InsertNewUser(user); err != nil {
		http.Error(w, "error inserting user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	if err = respond(w, user, http.StatusCreated); err != nil {
		http.Error(w, "error responding with user: "+err.Error(), http.StatusBadRequest)
		return
	}

}
