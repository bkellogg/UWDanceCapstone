package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

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
	newRehearsals := models.NewRehearsalTimes{}
	if dberr := receive(r, &newRehearsals); dberr != nil {
		return dberr
	}

	dancers, castingAudID, err := ctx.Session.ConfirmCast(u.ID)
	if err != nil {
		return HTTPError(fmt.Sprintf("error posting casting: %v", err), http.StatusBadRequest)
	}

	show, dberr := ctx.Session.Store.GetShowByAuditionID(castingAudID, false)
	if dberr != nil {
		return middleware.HTTPErrorFromDBErrorContext(dberr, "getting show by audition id")
	}
	np := &models.NewPiece{
		Name:            u.FirstName + "'s Piece",
		ChoreographerID: int(u.ID),
		ShowID:          show.ID,
		CreatedBy:       int(u.ID),
	}
	var piece *models.Piece
	piece, dberr = ctx.Session.Store.GetChoreographerShowPiece(show.ID, int(u.ID))
	if dberr != nil && dberr.HTTPStatus != http.StatusNotFound {
		return middleware.HTTPErrorFromDBErrorContext(dberr, "error looking up existing piece")
	}

	pcr := &models.PostCastingResponse{}

	if piece == nil {
		piece, dberr = ctx.Session.Store.InsertNewPiece(np)
		if dberr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dberr, "inserting new piece when posting casting")
		}
	}

	rehearsals, dberr := ctx.Session.Store.InsertPieceRehearsals(u.ID, piece.ID, newRehearsals)
	if dberr != nil {
		pcr.Message = "failed to create piece rehearsals: " + err.Error()
	} else {
		pcr.Rehearsals = rehearsals
	}

	confResultChan := make(chan *models.CastingConfResult)

	for _, id64 := range dancers {
		go handleUserInvite(ctx, int(id64), u, piece, confResultChan)
	}

	results := make([]*models.CastingConfResult, 0, len(dancers))

	// wait until we have all of the results
	for len(results) < len(dancers) {
		res := <-confResultChan
		results = append(results, res)
	}
	pcr.CastingResults = results
	return respond(w, pcr, http.StatusOK)
}

// handleUserInvite handles creating an invite for the given dancerID for the given
// piece and sending them an email
// Intended to be used on its own goroutine so does not return an error but
// logs all errors to standard out.
// Sends result for user into the given result channel
func handleUserInvite(ctx *CastingContext, dancerID int, chor *models.User, piece *models.Piece, resultChan chan *models.CastingConfResult) {
	result := &models.CastingConfResult{
		InviteCreated: false,
		EmailSent:     false,
		IsError:       false,
	}
	// send the result into the channel
	defer func() {
		resultChan <- result
	}()
	user, dberr := ctx.Session.Store.GetUserByID(dancerID, false)
	if dberr != nil {
		result.Message = fmt.Sprintf("error getting user with dancerID %d: %s\n", dancerID, dberr.Message)
		result.IsError = true
		return
	}
	result.Dancer = user

	dberr = ctx.Session.Store.MarkInvite(dancerID, piece.ID, appvars.CastStatusExpired)
	if dberr != nil && dberr.HTTPStatus != http.StatusNotFound {
		result.Message = fmt.Sprintf("could not mark old invite as expired: %s", dberr.Message)
		result.IsError = true
		return
	}

	inPiece, dberr := ctx.Session.Store.UserIsInPiece(dancerID, piece.ID)
	if dberr != nil {
		result.Message = fmt.Sprintf("error determining if user is in piece: %s", dberr.Message)
		result.IsError = true
		return
	}

	// only create a new invite if the user is not already in the piece.
	if !inPiece {
		expiryTime := time.Now().Add(appvars.AcceptCastTime)

		dberr = ctx.Session.Store.InsertNewUserPieceInvite(int(user.ID), piece.ID, expiryTime)
		if dberr != nil {
			result.Message = fmt.Sprintf("error creating new user piece pending entry: %v", dberr.Message)
			result.IsError = true
			return
		}
		result.InviteCreated = true

		expiryTimeHour, expiryTimeMinute, expiryTimeSecond, expiryTimePeriod := getNormalizedTimeParts(expiryTime)

		expiryTimeFormat := fmt.Sprintf("%s, %s %d at %s:%s:%s %s",
			expiryTime.Weekday().String(),
			expiryTime.Month().String(),
			expiryTime.Day(),
			expiryTimeHour,
			expiryTimeMinute,
			expiryTimeSecond,
			expiryTimePeriod)
		tplVars := &models.CastingConfVars{
			Name:       user.FirstName,
			ChorFName:  chor.FirstName,
			ChorLName:  chor.LastName,
			ExpiryTime: expiryTimeFormat,
			URL:        appvars.StageURL,
		}

		// do not send the email if we are in debug mode
		if ctx.IsDebugMode {
			result.Message = "debug mode enabled; email not sent"
			return
		}
		message, err := mail.NewMessageFromTemplate(ctx.MailCredentials,
			ctx.CastingTPLPath,
			appvars.CastInPieceSubject,
			tplVars,
			[]string{user.Email})
		if err != nil {
			result.Message = fmt.Sprintf("error merging message into email template: %v\n", err)
			result.IsError = true
			return
		}
		if err = message.Send(); err != nil {
			result.Message = fmt.Sprintf("error sending email: %v", err)
			result.IsError = true
			return
		}
		result.EmailSent = true
	} else {
		result.Message = "user is already in this piece; invite not created and the email was not sent"
	}
}

func getNormalizedTimeParts(time time.Time) (string, string, string, string) {
	expiryTimeHour := time.Hour()
	expiryTimePeriod := "A.M."

	if expiryTimeHour > 12 {
		expiryTimeHour = expiryTimeHour - 12
		expiryTimePeriod = "P.M."
	}

	expiryTimeMinute := time.Minute()
	expiryTimeMinuteString := strconv.Itoa(expiryTimeMinute)
	if expiryTimeMinute/10 == 0 {
		expiryTimeMinuteString = "0" + expiryTimeMinuteString
	}

	expiryTimeSecond := time.Second()
	expiryTimeSecondString := strconv.Itoa(expiryTimeSecond)
	if expiryTimeSecond/10 == 0 {
		expiryTimeSecondString = "0" + expiryTimeSecondString
	}

	return strconv.Itoa(expiryTimeHour), expiryTimeMinuteString, expiryTimeSecondString, expiryTimePeriod
}
