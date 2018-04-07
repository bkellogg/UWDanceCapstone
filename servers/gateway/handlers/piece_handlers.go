package handlers

import (
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// PiecesHandler handles requests for the shows resource.
func (ctx *AuthContext) PiecesHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CreatePieces) {
			return permissionDenied()
		}
		newPiece := &models.NewPiece{}
		httperr := receive(r, newPiece)
		if httperr != nil {
			return httperr
		}
		user, dberr := ctx.store.GetUserByID(newPiece.ChoreographerID, false)
		if dberr != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
		}
		if !ctx.permChecker.UserIs(user, appvars.PermChoreographer) {
			return HTTPError("cannot add non choreographers as choreographers to pieces", http.StatusBadRequest)
		}
		newPiece.CreatedBy = int(u.ID)
		piece, dberr := ctx.store.InsertNewPiece(newPiece)
		if dberr != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
		}
		return respond(w, piece, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// SpecificPieceHandler handles requests to a specific piece.
func (ctx *AuthContext) SpecificPieceHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	pieceIDString := mux.Vars(r)["id"]
	pieceID, err := strconv.Atoi(pieceIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}
	includeDeleted := getIncludeDeletedParam(r)
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeePieces) {
			return permissionDenied()
		}
		piece, err := ctx.store.GetPieceByID(pieceID, includeDeleted)
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		if piece == nil {
			return objectNotFound("piece")
		}
		return respond(w, piece, http.StatusOK)
	case "DELETE":
		if !ctx.permChecker.UserCan(u, permissions.DeletePieces) {
			return permissionDenied()
		}
		err := ctx.store.DeletePieceByID(pieceID)
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respondWithString(w, "piece deleted", http.StatusOK)
	default:
		return methodNotAllowed()
	}
}

// PieceChoreographerHandler handles requests for choreographers
// on a specific piece
func (ctx *AuthContext) PieceChoreographerHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if !ctx.permChecker.UserCan(u, permissions.AddStaffToPiece) {
		return permissionDenied()
	}
	vars := mux.Vars(r)
	pieceIDString := vars["id"]
	pieceID, err := strconv.Atoi(pieceIDString)
	if err != nil {
		return HTTPError("unparsable user ID given: "+err.Error(), http.StatusBadRequest)
	}
	object := vars["object"]
	if object != "choreographer" {
		return objectTypeNotSupported()
	}
	choreographerIDString := vars["objectID"]
	choreographerID, err := strconv.Atoi(choreographerIDString)
	if err != nil {
		return HTTPError("unparsable piece ID given: "+err.Error(), http.StatusBadRequest)
	}

	user, dberr := ctx.store.GetUserByID(choreographerID, false)
	if err != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	if user == nil {
		return HTTPError("no user exists with the given id", http.StatusNotFound)
	}
	if !ctx.permChecker.UserIs(user, appvars.PermChoreographer) {
		return HTTPError("cannot add non choreographers as choreographers to pieces", http.StatusBadRequest)
	}

	dberr = ctx.store.AssignChoreographerToPiece(choreographerID, pieceID)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return respondWithString(w, "choreographer added", http.StatusOK)
}
