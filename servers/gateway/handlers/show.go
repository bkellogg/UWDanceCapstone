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
	case "POST":
		if !u.Can(permissions.CreateShows) {
			return permissionDenied()
		}
		newShow := &models.NewShow{}
		err := recieve(r, newShow)
		if err != nil {
			return HTTPError("error decoding new show: "+err.Error(), http.StatusBadRequest)
		}
		show, err := ctx.Database.InsertNewShow(newShow)
		if err != nil {
			return HTTPError("error inserting new show:"+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, show, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// SpecificShowHandler handles requests to a specifc show.
func (ctx *AuthContext) SpecificShowHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	showIDString := mux.Vars(r)["id"]
	showID, err := strconv.Atoi(showIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}
	switch r.Method {
	case "GET":
		if !u.Can(permissions.SeeShows) {
			return permissionDenied()
		}
		show, err := ctx.Database.GetShowByID(showID)
		if err != nil {
			return HTTPError("error getting show by ID: "+err.Error(), http.StatusInternalServerError)
		}
		if show == nil {
			return objectNotFound("show")
		}
		return respond(w, show, http.StatusOK)
	case "DELETE":
		if !u.Can(permissions.DeleteShows) {
			return permissionDenied()
		}
		err := ctx.Database.DeleteShowByID(showID)
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

// ResourceForShowAuditionHandler handles requests for a specifc resource on a specific audition.
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
	audition, err := ctx.Database.GetShowByID(showID)
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
		if !u.Can(permissions.SeeAllUsers) {
			return permissionDenied()
		}
		return respondWithString(w, "TODO: Implement the users resource for shows", http.StatusNotImplemented)
	case "pieces":
		if !u.Can(permissions.SeePieces) {
			return permissionDenied()
		}
		shows, err := ctx.Database.GetPiecesByShowID(showID)
		if err != nil {
			return HTTPError("error getting shows by audition id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, shows, http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}
