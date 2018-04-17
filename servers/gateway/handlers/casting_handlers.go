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
	// make sure the user is requesting the casting resource
	vars := mux.Vars(r)
	if vars["object"] != "casting" {
		return objectTypeNotSupported()
	}
	// make sure the user that is trying to be casting is at least a choreographer
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermChoreographer) {
		return permissionDenied()
	}

	// get the audition id
	audID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}

	// make sure the audition exists before continuing
	_, dberr := ctx.Session.Store.GetAuditionByID(audID, false)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}

	// TODO: re-add this when ready for production
	//client, found := ctx.Notifier.GetClient(u.ID)
	//if !found {
	//	return HTTPError("user must have at least one websocket connection to begin casting", http.StatusBadRequest)
	//}
	//client.AddCasting()

	// if the session hasn't yet started, start it by loading users from the audition
	// into it.
	if !ctx.Session.HasBegun {
		if err := ctx.Session.LoadFromAudition(audID); err != nil {
			return HTTPError(
				fmt.Sprintf("error loading users from audition into casting session: %s", err.Message),
				err.Status)
		}
	}

	// add the current user as a choreographer to the current casting session
	if err = ctx.Session.AddChoreographer(u.ID); err != nil {
		return HTTPError(
			fmt.Sprintf("error adding current user to casting session: %v", err),
			http.StatusBadRequest)
	}

	// respond with a success message
	return respondWithString(w,
		fmt.Sprintf("success; user id '%d' will now receive casting updates", u.ID),
		http.StatusOK)
}

// FlushCastingHandler handles requests to flush the casting session
func (ctx *CastingContext) FlushCastingHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermAdmin) {
		return permissionDenied()
	}
	ctx.Session.Flush()
	return respondWithString(w, "casting session flushed", http.StatusOK)
}
