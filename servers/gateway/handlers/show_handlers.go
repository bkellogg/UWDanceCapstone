package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
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
			code := http.StatusInternalServerError
			if err.Error() == appvars.ErrInvalidHistoryOption {
				code = http.StatusBadRequest
			}
			return HTTPError("error getting shows: "+err.Error(), code)
		}
		return respond(w, models.PaginateShows(shows, page), http.StatusOK)
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CreateShows) {
			return permissionDenied()
		}
		newShow := &models.NewShow{}
		err := receive(r, newShow)
		if err != nil {
			return HTTPError("error decoding new show: "+err.Error(), http.StatusBadRequest)
		}
		newShow.CreatedBy = int(u.ID)
		if err := newShow.Validate(); err != nil {
			return HTTPError("new show validation failed: "+err.Error(), http.StatusBadRequest)
		}
		show, err := ctx.store.InsertNewShow(newShow)
		if err != nil {
			return HTTPError("error inserting new show:"+err.Error(), http.StatusInternalServerError)
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

// ResourceForSpecificShowHandler handles requests for a specifc resource on a specific audition.
func (ctx *AuthContext) ResourceForSpecificShowHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if r.Method != "GET" {
		return methodNotAllowed()
	}

	muxVars := mux.Vars(r)
	showIDString := muxVars["id"]
	showID, err := strconv.Atoi(showIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}

	includeDeleted := getIncludeDeletedParam(r)
	page, httperr := getPageParam(r)
	if httperr != nil {
		return httperr
	}

	audition, err := ctx.store.GetShowByID(showID, includeDeleted)
	if err != nil {
		return HTTPError("error getting show by ID: "+err.Error(), http.StatusInternalServerError)
	}
	if audition == nil {
		return objectNotFound("show")
	}

	object := muxVars["object"]
	switch object {
	case "users":
		// TODO: Change this to "permissions to see users in audition"
		if !ctx.permChecker.UserCan(u, permissions.SeeAllUsers) {
			return permissionDenied()
		}
		return respondWithString(w, "TODO: Implement the users resource for shows", http.StatusNotImplemented)
	case "pieces":
		if ctx.permChecker.UserCan(u, permissions.SeePieces) {
			return permissionDenied()
		}
		pieces, err := ctx.store.GetPiecesByShowID(showID, page, includeDeleted)
		if err != nil {
			return HTTPError("error getting shows by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginatePieces(pieces, page), http.StatusOK)
	default:
		return objectTypeNotSupported()
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
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		return respond(w, showTypes, http.StatusOK)
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CreateShowTypes) {
			return permissionDenied()
		}
		showType := &models.ShowType{}
		if err := receive(r, showType); err != nil {
			return receiveFailed()
		}
		showType.CreatedBy = int(u.ID)
		if err := showType.Validate(); err != nil {
			return HTTPError("show type validation failed: "+err.Error(), http.StatusBadRequest)
		}
		if err := ctx.store.InsertNewShowType(showType); err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		return respond(w, showType, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}
