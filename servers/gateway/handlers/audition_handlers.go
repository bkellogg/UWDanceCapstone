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
		if !ctx.permChecker.UserCan(u, permissions.CreateAuditions) {
			return permissionDenied()
		}
		newAud := &models.NewAudition{}
		err := receive(r, newAud)
		if err != nil {
			return HTTPError("error decoding new audition: "+err.Error(), http.StatusBadRequest)
		}
		newAud.CreatedBy = int(u.ID)
		if err := newAud.Validate(); err != nil {
			return HTTPError("new audition validation failed: "+err.Error(), http.StatusBadRequest)
		}
		audition, err := ctx.store.InsertNewAudition(newAud)
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
	includeDeleted := getIncludeDeletedParam(r)
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeAuditions) {
			return permissionDenied()
		}
		audition, err := ctx.store.GetAuditionByID(audID, includeDeleted)
		if err != nil {
			return HTTPError("error getting audition by ID: "+err.Error(), http.StatusInternalServerError)
		}
		if audition == nil {
			return objectNotFound("audition")
		}
		return respond(w, audition, http.StatusOK)
	case "DELETE":
		if !ctx.permChecker.UserCan(u, permissions.DeleteAuditions) {
			return permissionDenied()
		}
		err := ctx.store.DeleteAuditionByID(audID)
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
	includeDeleted := getIncludeDeletedParam(r)
	audition, err := ctx.store.GetAuditionByID(audID, includeDeleted)
	if err != nil {
		return HTTPError("error getting audition by ID: "+err.Error(), http.StatusInternalServerError)
	}
	if audition == nil {
		return objectNotFound("audition")
	}

	object := muxVars["object"]
	page, httperr := getPageParam(r)
	if httperr != nil {
		return httperr
	}
	switch object {
	case "users":
		// TODO: Change this to "permissions to see users in audition"
		if !ctx.permChecker.UserCan(u, permissions.SeeAllUsers) {
			return permissionDenied()
		}
		users, err := ctx.store.GetUsersByAuditionID(audID, page, includeDeleted)
		if err != nil {
			return HTTPError("error getting users by audition id: "+err.Error(), http.StatusInternalServerError)
		}

		userResponses, err := ctx.permChecker.ConvertUserSliceToUserResponseSlice(users)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginateUserResponses(userResponses, page), http.StatusOK)
	case "pieces":
		// TODO: Change this to "permissions to see pieces in audition"
		if !ctx.permChecker.UserCan(u, permissions.SeePieces) {
			return permissionDenied()
		}
		pieces, err := ctx.store.GetPiecesByAuditionID(audID, page, includeDeleted)
		if err != nil {
			return HTTPError("error getting pieces by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, pieces, http.StatusOK)
	case "shows":
		if !ctx.permChecker.UserCan(u, permissions.SeeShows) {
			return permissionDenied()
		}
		shows, err := ctx.store.GetShowsByAuditionID(audID, page, includeDeleted)
		if err != nil {
			return HTTPError("error getting shows by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginateShows(shows, page), http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}
