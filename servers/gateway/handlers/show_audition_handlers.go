package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// ShowAuditionRelationshipHandler handles requests to modify a specific audition in relation
// to a show.
func (ctx *AuthContext) ShowAuditionRelationshipHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	object := vars["object"]
	if object != "auditions" {
		return objectTypeNotSupported()
	}
	showID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}
	audID, err := strconv.Atoi(vars["objectID"])
	if err != nil {
		return unparsableIDGiven()
	}
	if !ctx.permChecker.UserCan(u, permissions.ModifyShowAuditionRelationship) {
		return permissionDenied()
	}

	var assigning bool // whether or not we are assigning or unassigning the audition from the show
	var message string // message to report back

	switch r.Method {
	case "LINK":
		assigning = true
		message = fmt.Sprintf("audition id '%d' is now associated with show id '%d'", audID, showID)
	case "UNLINK":
		assigning = false
		message = fmt.Sprintf("audition id '%d' is no longer associated with show id '%d'", audID, showID)
	default:
		return methodNotAllowed()
	}

	dberr := ctx.store.ModifyShowAuditionRelationship(showID, audID, assigning)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return respondWithString(w, message, http.StatusOK)
}

// handleUsersForAudition handles requests getting the users in an audition
func (ctx *AuthContext) handleUsersForAudition(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	audID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}
	if !ctx.permChecker.UserCanSeeUsersInAudition(u, audID) {
		return permissionDenied()
	}
	page, httperr := getPageParam(r)
	if httperr != nil {
		return httperr
	}
	includeDeleted := getIncludeDeletedParam(r)

	users, dberr := ctx.store.GetUsersByAuditionID(audID, page, includeDeleted)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	userRespnses, err := ctx.permChecker.ConvertUserSliceToUserResponseSlice(users)
	if err != nil {
		return HTTPError(fmt.Sprintf("error converting users to user responses: %v", err), http.StatusInternalServerError)
	}
	return respond(w, models.PaginateUserResponses(userRespnses, page), http.StatusOK)
}
