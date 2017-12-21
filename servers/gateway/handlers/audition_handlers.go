package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// AuditionsHandler handles requests for the auditions resource.
func (ctx *AuthContext) AuditionsHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "POST":
		if !u.Can(permissions.CreateAuditions) {
			return permissionDenied()
		}
		newAud := &models.NewAudition{}
		err := recieve(r, newAud)
		if err != nil {
			return HTTPError("error decoding new audition: "+err.Error(), http.StatusBadRequest)
		}
		audition, err := ctx.Database.InsertNewAudition(newAud)
		if err != nil {
			return HTTPError(fmt.Sprintf("error inserting new audition: %v", err), http.StatusInternalServerError)
		}
		return respond(w, audition, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// SpecificAuditionHandler handles requests to a specifc audition.
func (ctx *AuthContext) SpecificAuditionHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	audIDString := mux.Vars(r)["id"]
	audID, err := strconv.Atoi(audIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}
	switch r.Method {
	case "GET":
		if !u.Can(permissions.SeeAuditions) {
			return permissionDenied()
		}
		audition, err := ctx.Database.GetAuditionByID(audID)
		if err != nil {
			return HTTPError("error getting audition by ID: "+err.Error(), http.StatusInternalServerError)
		}
		if audition == nil {
			return objectNotFound("audition")
		}
		return respond(w, audition, http.StatusOK)
	case "DELETE":
		if !u.Can(permissions.DeleteAuditions) {
			return permissionDenied()
		}
		err := ctx.Database.DeleteAuditionByID(audID)
		if err == nil {
			return respondWithString(w, "audition deleted", http.StatusOK)
		}
		if err == sql.ErrNoRows {
			return objectNotFound("audition")
		}
		return HTTPError("error deleting audition: "+err.Error(), http.StatusInternalServerError)
	default:
		return methodNotAllowed()
	}
}

// ResourceForSpecificAuditionHandler handles requests for a specifc resource on a specific audition.
func (ctx *AuthContext) ResourceForSpecificAuditionHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if r.Method != "GET" {
		return methodNotAllowed()
	}

	muxVars := mux.Vars(r)
	audIDString := muxVars["id"]
	audID, err := strconv.Atoi(audIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}
	audition, err := ctx.Database.GetAuditionByID(audID)
	if err != nil {
		return HTTPError("error getting audition by ID: "+err.Error(), http.StatusInternalServerError)
	}
	if audition == nil {
		return objectNotFound("audition")
	}

	object := muxVars["object"]
	switch object {
	case "users":
		// TODO: Change this to "permissions to see users in audition"
		if !u.Can(permissions.SeeAllUsers) {
			return permissionDenied()
		}
		users, err := ctx.Database.GetUsersByAuditionID(audID)
		if err != nil {
			return HTTPError("error getting users by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, users, http.StatusOK)
	case "pieces":
		// TODO: Change this to "permissions to see pieces in audition"
		if !u.Can(permissions.SeePieces) {
			return permissionDenied()
		}
		pieces, err := ctx.Database.GetPiecesByAuditionID(audID)
		if err != nil {
			return HTTPError("error getting pieces by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, pieces, http.StatusOK)
	case "shows":
		if !u.Can(permissions.SeeShows) {
			return permissionDenied()
		}
		shows, err := ctx.Database.GetShowsByAuditionID(audID)
		if err != nil {
			return HTTPError("error getting shows by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, shows, http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}
