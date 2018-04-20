package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/notify"
	"github.com/gorilla/mux"
)

// DebugCastingStateHandler is a debug handle that will return the current state of the casting session.
// This is a debug handle and should be used in production.
func (ctx *CastingContext) DebugCastingStateHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if r.URL.Query().Get("onlyCastingUpdate") == "true" {
		response, err := ctx.Session.ToCastingUpdate(u.ID)
		if err != nil {
			return HTTPError(fmt.Sprintf("error generating casting update: %v", err), http.StatusInternalServerError)
		}
		return respond(w, response, http.StatusOK)
	}
	return respond(w, ctx.Session, http.StatusOK)
}

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
	client, found := ctx.Session.GetClient(u.ID)
	if !found {
		return HTTPError("user must have at least one websocket connection to begin casting", http.StatusBadRequest)
	}
	client.AddCasting()

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
	if err = ctx.Session.AddChoreographer(u); err != nil {
		return HTTPError(
			fmt.Sprintf("error adding current user to casting session: %v", err),
			http.StatusBadRequest)
	}

	// respond with a success message
	return respondWithString(w,
		fmt.Sprintf("success; user id '%d' will now receive casting updates", u.ID),
		http.StatusOK)
}

// CastingUpdateHandler handles update requests to the current casting session.
func (ctx *CastingContext) CastingUpdateHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	// make sure the user is requesting the casting resource
	vars := mux.Vars(r)
	if vars["object"] != "casting" {
		return objectTypeNotSupported()
	}
	// make sure the user that is trying to be casting is at least a choreographer
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermChoreographer) {
		return permissionDenied()
	}

	if !ctx.Session.HasBegun {
		return HTTPError("casting session has not begun", http.StatusBadRequest)
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

	cu := &notify.ChoreographerUpdate{}
	if dberr := receive(r, cu); dberr != nil {
		return dberr
	}

	if err = ctx.Session.Handle(u.ID, cu); err != nil {
		return HTTPError(fmt.Sprintf("error processing updates: %v", err), http.StatusBadRequest)
	}
	return respondWithString(w, "updates received", http.StatusOK)
}

// FlushCastingHandler handles requests to flush the casting session
func (ctx *CastingContext) FlushCastingHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermAdmin) {
		return permissionDenied()
	}
	ctx.Session.Flush()
	return respondWithString(w, "casting session flushed", http.StatusOK)
}
