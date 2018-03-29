package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

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
		newPiece.CreatedBy = int(u.ID)
		piece, err := ctx.store.InsertNewPiece(newPiece)
		if err != nil {
			return HTTPError("error inserting new piece:"+err.Error(), http.StatusInternalServerError)
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
			return HTTPError("error getting piece by ID: "+err.Error(), http.StatusInternalServerError)
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
		if err == nil {
			return respondWithString(w, "piece deleted", http.StatusOK)
		}
		if err == sql.ErrNoRows {
			return objectNotFound("piece")
		}
		return HTTPError("error deleting piece: "+err.Error(), http.StatusInternalServerError)
	default:
		return methodNotAllowed()
	}
}
