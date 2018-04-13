package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/mux"
)

// handleUsersForShow is helper function that handles getting users for
// specific shows
func (ctx *AuthContext) handleUsersForShow(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	showID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}
	if !ctx.permChecker.UserCanSeeUsersInShow(u, showID) {
		return permissionDenied()
	}
	page, httperr := getPageParam(r)
	if httperr != nil {
		return httperr
	}
	includeDeleted := getIncludeDeletedParam(r)

	users, dberr := ctx.store.GetUsersByShowID(showID, page, includeDeleted)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	userRespnses, err := ctx.permChecker.ConvertUserSliceToUserResponseSlice(users)
	if err != nil {
		return HTTPError(fmt.Sprintf("error converting users to user responses: %v", err), http.StatusInternalServerError)
	}
	return respond(w, models.PaginateUserResponses(userRespnses, page), http.StatusOK)
}
