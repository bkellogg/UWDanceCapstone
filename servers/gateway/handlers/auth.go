package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

func (ctx *AuthContext) TestHandler(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("success!"))
}

// UserSignUpHandler handles requests for user sign ups
func (ctx *AuthContext) UserSignUpHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "requests to /api/v1/users must be POST", http.StatusMethodNotAllowed)
		return
	}
	signUpRequest := &models.SignUpRequest{}
	if err := recieve(r, signUpRequest); err != nil {
		http.Error(w, "error decoding request: "+err.Error(), http.StatusBadRequest)
		return
	}

	if signUpRequest.Password != signUpRequest.PasswordConf {
		http.Error(w, "passwords did not match", http.StatusBadRequest)
		return
	}

	// TODO: Ensure that accounts with duplicate usernames cannot be created
	// TODO: Ensure that accounts with  duplicate emails cannot be created

	// TODO: Replace with Stored Procedure
}
