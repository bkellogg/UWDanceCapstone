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
		httperr := receive(r, newAud)
		if httperr != nil {
			return httperr
		}
		newAud.CreatedBy = int(u.ID)
		audition, err := ctx.store.InsertNewAudition(newAud)
		if err != nil {
			return HTTPError(fmt.Sprintf("error inserting new audition: %v", err), http.StatusInternalServerError)
		}
		return respond(w, audition, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// SpecificAuditionHandler handles requests to a specific audition.
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
		audition, dberr := ctx.store.GetAuditionByID(audID, includeDeleted)
		if dberr != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
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
	case "PATCH":
		if !ctx.permChecker.UserCan(u, permissions.ModifyAuditions) {
			return permissionDenied()
		}
		updates := &models.AuditionUpdate{}
		if httperr := receive(r, updates); err != nil {
			return httperr
		}
		dberr := ctx.store.UpdateAuditionByID(audID, updates)
		if dberr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dberr, "error updating audition")
		}
		return respondWithString(w, "audition updated", http.StatusOK)
	default:
		return methodNotAllowed()
	}
}
