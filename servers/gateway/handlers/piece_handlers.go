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
		if !u.Can(permissions.CreateShows) {
			return permissionDenied()
		}
		newPiece := &models.NewPiece{}
		err := recieve(r, newPiece)
		if err != nil {
			return HTTPError("error decoding new show: "+err.Error(), http.StatusBadRequest)
		}
		piece, err := ctx.Database.InsertNewPiece(newPiece)
		if err != nil {
			return HTTPError("error inserting new show:"+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, piece, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// SpecificPieceHandler handles requests to a specifc piece.
func (ctx *AuthContext) SpecificPieceHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	pieceIDString := mux.Vars(r)["id"]
	pieceID, err := strconv.Atoi(pieceIDString)
	if err != nil {
		return HTTPError("unparsable ID given: "+err.Error(), http.StatusBadRequest)
	}
	includeDeleted := getIncludeDeletedParam(r)
	switch r.Method {
	case "GET":
		if !u.Can(permissions.SeePieces) {
			return permissionDenied()
		}
		piece, err := ctx.Database.GetPieceByID(pieceID, includeDeleted)
		if err != nil {
			return HTTPError("error getting piece by ID: "+err.Error(), http.StatusInternalServerError)
		}
		if piece == nil {
			return objectNotFound("piece")
		}
		return respond(w, piece, http.StatusOK)
	case "DELETE":
		if !u.Can(permissions.DeletePieces) {
			return permissionDenied()
		}
		err := ctx.Database.DeletePieceByID(pieceID)
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
