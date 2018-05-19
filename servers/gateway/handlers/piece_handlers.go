package handlers

import (
	"fmt"
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
		if !ctx.permChecker.UserIsAtLeast(user, appvars.PermChoreographer) {
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

// PieceObjectIDHandler handles requests for api/v1/pieces/{id}/{object}/{id}
func (ctx *AuthContext) PieceObjectIDHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	pieceIDString := vars["id"]
	pieceID, err := strconv.Atoi(pieceIDString)
	if err != nil {
		return HTTPError("unparsable user ID given: "+err.Error(), http.StatusBadRequest)
	}
	object := vars["object"]
	switch object {
	case "choreographer":
		if r.Method != "PUT" {
			return methodNotAllowed()
		}
		if !ctx.permChecker.UserCan(u, permissions.AddStaffToPiece) {
			return permissionDenied()
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
		if !ctx.permChecker.UserIsAtLeast(user, appvars.PermChoreographer) {
			return HTTPError("cannot add non choreographers as choreographers to pieces", http.StatusBadRequest)
		}

		dberr = ctx.store.AssignChoreographerToPiece(choreographerID, pieceID)
		if dberr != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
		}
		return respondWithString(w, "choreographer added", http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}

// PieceObjectHandler handles requests for api/v1/pieces/{id}/{object}
func (ctx *AuthContext) PieceObjectHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	pieceIDString := vars["id"]
	pieceID, err := strconv.Atoi(pieceIDString)
	if err != nil {
		return HTTPError("unparsable user ID given: "+err.Error(), http.StatusBadRequest)
	}
	object := vars["object"]
	switch object {
	case "users":
		if r.Method != "GET" {
			return methodNotAllowed()
		}
		if !ctx.permChecker.UserCanSeeUsersInPiece(u, pieceID) {
			return permissionDenied()
		}
		page, httperr := getPageParam(r)
		if httperr != nil {
			return httperr
		}

		users, chor, dberr := ctx.store.GetUsersByPieceID(pieceID, page, getIncludeDeletedParam(r))
		if dberr != nil {
			return middleware.HTTPErrorFromDBErrorContext(dberr, "error getting users by piece id")
		}

		chorRes, err := ctx.permChecker.ConvertUserToUserResponse(chor)
		if err != nil {
			return HTTPError(fmt.Sprintf("error converting users to user responses: %v", err), http.StatusInternalServerError)
		}
		userRes, err := ctx.permChecker.ConvertUserSliceToUserResponseSlice(users)
		if err != nil {
			return HTTPError(fmt.Sprintf("error converting users to user responses: %v", err), http.StatusInternalServerError)
		}
		return respond(w, models.NewPieceUsersResponse(page, chorRes, userRes), http.StatusOK)
	case "info":
		if r.Method == "POST" {
			if !ctx.permChecker.UserCanModifyPieceInfo(u, pieceID) {
				return permissionDenied()
			}
			piece, dberr := ctx.store.GetPieceByID(pieceID, false)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error getting piece by id")
			}
			if piece.InfoSheetID != 0 {
				return HTTPError(fmt.Sprintf("piece already has an info sheet with id: %d", piece.InfoSheetID),
					http.StatusBadRequest)
			}
			pieceInfo := &models.NewPieceInfoSheet{}
			if httperr := receive(r, pieceInfo); httperr != nil {
				return httperr
			}
			info, dberr := ctx.store.InsertNewPieceInfoSheet(int(u.ID), pieceID, pieceInfo)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error inserting piece info")
			}
			return respond(w, info, http.StatusCreated)
		} else if r.Method == "GET" {
			if !ctx.permChecker.UserCanSeePieceInfo(u, pieceID) {
				return permissionDenied()
			}
			pieceInfo, dberr := ctx.store.GetPieceInfoSheet(pieceID)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error getting piece info sheet")
			}
			return respond(w, pieceInfo, http.StatusOK)
		} else if r.Method == "DELETE" {
			if !ctx.permChecker.UserCanModifyPieceInfo(u, pieceID) {
				return permissionDenied()
			}
			dberr := ctx.store.DeletePieceInfoSheet(pieceID)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error deleting piece info sheet")
			}
			return respondWithString(w, fmt.Sprintf("piece %d's info sheet has been deleted", pieceID), http.StatusOK)
		} else {
			return methodNotAllowed()
		}
	case "rehearsals":
		if r.Method == "POST" {
			if !ctx.permChecker.UserCanModifyPieceInfo(u, pieceID) {
				return permissionDenied()
			}
			newRehearsals := models.NewRehearsalTimes{}
			if err := receive(r, &newRehearsals); err != nil {
				return err
			}

			rehearsals, dberr := ctx.store.InsertPieceRehearsals(u.ID, pieceID, newRehearsals)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error inserting piece rehearsals")
			}
			return respond(w, rehearsals, http.StatusCreated)
		} else if r.Method == "GET" {
			if !ctx.permChecker.UserCanSeePieceInfo(u, pieceID) {
				return permissionDenied()
			}
			rehearsals, dberr := ctx.store.GetPieceRehearsals(pieceID)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error getting piece rehearsal times")
			}
			return respond(w, rehearsals, http.StatusOK)
		} else if r.Method == "DELETE" {
			if !ctx.permChecker.UserCanModifyPieceInfo(u, pieceID) {
				return permissionDenied()
			}
			dberr := ctx.store.DeletePieceRehearsals(pieceID)
			if dberr != nil {
				return middleware.HTTPErrorFromDBErrorContext(dberr, "error deleteing piece rehearsal times")
			}
			return respondWithString(w, "piece rehearsal times deleted", http.StatusOK)
		} else {
			return methodNotAllowed()
		}
	default:
		return objectTypeNotSupported()
	}
}
