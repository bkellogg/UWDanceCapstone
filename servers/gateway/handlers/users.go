package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"path"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// AllUsersHandler handles requests for the all users resource
func (ctx *AuthContext) AllUsersHandler(w http.ResponseWriter, r *http.Request, u *models.User) {
	if r.Method != "GET" {
		http.Error(w, "unsupported method", http.StatusMethodNotAllowed)
		return
	}
	if !u.Can(permissions.SeeAllUsers) {
		http.Error(w, "you do not have access to this resource", http.StatusForbidden)
		return
	}
	users, err := ctx.Database.GetAllUsers()
	if err != nil {
		http.Error(w, "error getting users: "+err.Error(), http.StatusInternalServerError)
		return
	}

	respond(w, users, http.StatusOK)
}

// SpecificUserHandler handles requests for a specifc user
func (ctx *AuthContext) SpecificUserHandler(w http.ResponseWriter, r *http.Request, u *models.User) {
	_, userIDString := path.Split(r.URL.Path)
	var userID int
	var err error // ??????
	if userIDString == "me" {
		userID = int(u.ID)
	} else {
		fmt.Println(userIDString)
		userID, err = strconv.Atoi(userIDString)
		if err != nil {
			http.Error(w, "unparsable ID given: "+err.Error(), http.StatusBadRequest)
			return
		}
	}
	switch r.Method {
	case "GET":
		if !u.CanSeeUser(userID) {
			http.Error(w, "you do not have access to this resource", http.StatusForbidden)
			return
		}
		user, err := ctx.Database.GetUserByID(userID)
		if err != nil {
			http.Error(w, "error looking up user: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if user == nil {
			http.Error(w, "no user found", http.StatusBadRequest)
			return
		}

		respond(w, user, http.StatusOK)
	case "PATCH":
		if !u.CanModifyUser(userID) {
			http.Error(w, "you do not have access to this resource", http.StatusForbidden)
			return
		}
		// TODO: Implement this
		w.Write([]byte("TODO"))
	case "DELETE":
		if !u.CanDeleteUser(userID) {
			http.Error(w, "you do not have access to this resource", http.StatusForbidden)
			return
		}
		if err := ctx.Database.DeactivateUserByID(userID); err != nil {
			if err != sql.ErrNoRows {
				http.Error(w, "error deleting user: "+err.Error(), http.StatusInternalServerError)
				return
			}
			http.Error(w, "no user found", http.StatusBadRequest)
			return
		}
		respondWithString(w, "user has been deleted", 200)
	default:
		http.Error(w, "unsupported method", http.StatusMethodNotAllowed)
		return
	}
}
