package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// ShowsHandler handles requests for the shows resource.
func (ctx *AuthContext) ShowsHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeShows) {
			return permissionDenied()
		}
		page, httperr := getPageParam(r)
		if httperr != nil {
			return httperr
		}
		shows, err := ctx.store.GetShows(page, getHistoryParam(r), getIncludeDeletedParam(r), getStringParam(r, "type"))
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, models.PaginateShows(shows, page), http.StatusOK)
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CreateShows) {
			return permissionDenied()
		}
		newShow := &models.NewShow{}
		httperr := receive(r, newShow)
		if httperr != nil {
			return httperr
		}
		newShow.CreatedBy = int(u.ID)
		show, err := ctx.store.InsertNewShow(newShow)
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, show, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// SpecificShowHandler handles requests to a specific show.
func (ctx *AuthContext) SpecificShowHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	showIDString := mux.Vars(r)["id"]
	showID, err := strconv.Atoi(showIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}
	includeDeleted := getIncludeDeletedParam(r)
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeShows) {
			return permissionDenied()
		}
		show, err := ctx.store.GetShowByID(showID, includeDeleted)
		if err != nil {
			return HTTPError("error getting show by ID: "+err.Error(), http.StatusInternalServerError)
		}
		if show == nil {
			return objectNotFound("show")
		}
		return respond(w, show, http.StatusOK)
	case "DELETE":
		if !ctx.permChecker.UserCan(u, permissions.DeleteShows) {
			return permissionDenied()
		}
		err := ctx.store.DeleteShowByID(showID)
		if err == nil {
			return respondWithString(w, "show deleted", http.StatusOK)
		}
		if err == sql.ErrNoRows {
			return objectNotFound("show")
		}
		return HTTPError("error deleting show: "+err.Error(), http.StatusInternalServerError)
	default:
		return methodNotAllowed()
	}
}

// ShowTypeHandler handles general requests to the show type resource.
func (ctx *AuthContext) ShowTypeHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeShowTypes) {
			return permissionDenied()
		}
		showTypes, err := ctx.store.GetShowTypes(getIncludeDeletedParam(r))
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, showTypes, http.StatusOK)
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CreateShowTypes) {
			return permissionDenied()
		}
		showType := &models.ShowType{}
		if err := receive(r, showType); err != nil {
			return err
		}
		showType.CreatedBy = int(u.ID)
		if err := ctx.store.InsertNewShowType(showType); err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, showType, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}
