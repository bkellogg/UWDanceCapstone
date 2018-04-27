package handlers

import (
	"fmt"
	"log"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
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

// FlushCastingHandler handles requests to flush the casting session
func (ctx *CastingContext) FlushCastingHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermAdmin) {
		return permissionDenied()
	}
	ctx.Session.Flush()
	return respondWithString(w, "casting session flushed", http.StatusOK)
}

// CastingHandlerDispatcher dispatches requests for the auditions/id/casting resource.
func (ctx *CastingContext) CastingHandlerDispatcher(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	// ensure the intended object is casting
	if vars["object"] != "casting" {
		return objectTypeNotSupported()
	}

	// make sure the user that is trying to be casting is at least a choreographer
	if !ctx.permChecker.UserIsAtLeast(u, appvars.PermChoreographer) {
		return permissionDenied()
	}

	switch r.Method {
	case http.MethodPut:
		return ctx.handleBeginCasting(w, r, u)
	case http.MethodPatch:
		return ctx.handleCastingUpdate(w, r, u)
	case http.MethodPost:
		return ctx.handlePostCasting(w, r, u)
	default:
		return methodNotAllowed()
	}
}

// handleBeginCasting handles requests to begin casting.
func (ctx *CastingContext) handleBeginCasting(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {

	vars := mux.Vars(r)
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

	// Make sure that the client already has a websocket connection
	_, found := ctx.Session.GetClient(u.ID)
	if !found {
		return HTTPError("user must have at least one websocket connection to begin casting", http.StatusBadRequest)
	}

	// if the session hasn't yet started, start it by loading users from the audition
	// into it.
	if !ctx.Session.HasBegun {
		if err := ctx.Session.LoadFromAudition(audID); err != nil {
			return HTTPError(
				fmt.Sprintf("error loading users from audition into casting session: %s", err.Message),
				err.Status)
		}
	} else {
		if ctx.Session.Audition != audID {
			return HTTPError(
				fmt.Sprintf("casting session is already casting audition id %d",
					ctx.Session.Audition), http.StatusBadRequest)
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

// handleCastingUpdate handles update requests to the current casting session.
func (ctx *CastingContext) handleCastingUpdate(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)

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

// handlePostCasting handles requests to post casting
func (ctx *CastingContext) handlePostCasting(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	dancers, err := ctx.Session.ConfirmCast(u.ID)
	if err != nil {
		return HTTPError(fmt.Sprintf("error posting casting: %v", err), http.StatusBadRequest)
	}

	show, dberr := ctx.Session.Store.GetShowByAuditionID(ctx.Session.Audition, false)
	if dberr != nil {
		return middleware.HTTPErrorFromDBErrorContext(dberr, "getting show by audition id")
	}
	np := &models.NewPiece{
		Name:            u.FirstName + "'s Piece",
		ChoreographerID: int(u.ID),
		ShowID:          show.ID,
		CreatedBy:       int(u.ID),
	}
	_, dberr = ctx.Session.Store.InsertNewPiece(np)
	if dberr != nil {
		return middleware.HTTPErrorFromDBErrorContext(dberr, "inserting new piece when posting casting")
	}

	for id64 := range dancers {
		id := int(id64)
		user, dberr := ctx.Session.Store.GetUserByID(id, false)
		if dberr != nil {
			log.Printf("error getting user by id: %s\n", dberr.Message)
			continue
		}
		tplVars := &models.CastingConfVars{
			Name:          user.FirstName,
			Choreographer: u.FirstName,
			URL:           appvars.StageURL + "/dashboard",
		}

		message, err := mail.NewMessageFromTemplate(ctx.MailCredentials,
			ctx.CastingTPLPath,
			appvars.CastInPieceSubject,
			tplVars,
			[]string{user.Email})
		if err != nil {
			log.Printf("error generating message from template: %v\n", err)
			continue
		}
		if err = message.Send(); err != nil {
			log.Printf("error sending message: %v", err)
		}
	}

	return respond(w, dancers, http.StatusOK)
}
