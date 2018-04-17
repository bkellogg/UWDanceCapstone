package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/mux"
)

// BeginCastingHandler handles requests to begin casting.
func (ctx *CastingContext) BeginCastingHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	if vars["object"] != "casting" {
		return objectTypeNotSupported()
	}
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermChoreographer) {
		return permissionDenied()
	}
	audID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}

	_, dberr := ctx.Session.Store.GetAuditionByID(audID, false)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}

	//client, found := ctx.Notifier.GetClient(u.ID)
	//if !found {
	//	return HTTPError("user must have at least one websocket connection to begin casting", http.StatusBadRequest)
	//}
	//client.AddCasting()

	if !ctx.Session.HasBegun {
		if err := ctx.Session.LoadFromAudition(audID); err != nil {
			return HTTPError(fmt.Sprintf("error loading users from audition into casting session: %s", err.Message), err.Status)
		}
	}

	return respondWithString(w, fmt.Sprintf("success; user id '%d' will now receive casting updates", u.ID), http.StatusOK)
}
