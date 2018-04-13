package handlers

import (
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// getPiecesForShow is helper function that handles getting users for
// specific shows
func (ctx *AuthContext) getPiecesForShow(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	showID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}
	if ctx.permChecker.UserCan(u, permissions.SeePieces) {
		return permissionDenied()
	}
	includeDeleted := getIncludeDeletedParam(r)
	page, httperr := getPageParam(r)
	if httperr != nil {
		return httperr
	}

	pieces, dberr := ctx.store.GetPiecesByShowID(showID, page, includeDeleted)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return respond(w, models.PaginatePieces(pieces, page), http.StatusOK)
}
