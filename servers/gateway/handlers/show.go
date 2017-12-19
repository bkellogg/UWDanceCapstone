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

// SpecificShowHandler handles requests to a specifc audition.
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
		show, err := ctx.Database.GetAuditionByID(showID)
		if err != nil {
			return HTTPError("error getting show by ID: "+err.Error(), http.StatusInternalServerError)
		}
		if show == nil {
			return notFound("show")
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
			return notFound("show")
		}
		return HTTPError("error deleting show: "+err.Error(), http.StatusInternalServerError)
	default:
		return methodNotAllowed()
	}
}
