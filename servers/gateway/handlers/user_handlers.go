package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/gorilla/mux"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
)

// AllUsersHandler handles requests for the all users resource
func (ctx *AuthContext) AllUsersHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if r.Method != "GET" {
		return methodNotAllowed()
	}
	if !u.Can(permissions.SeeAllUsers) {
		return permissionDenied()
	}
	page, httperror := getPageParam(r)
	if httperror != nil {
		return httperror
	}
	includeInactive := getIncludeInactiveParam(r)
	users, err := ctx.Database.GetAllUsers(page, includeInactive)
	if err != nil {
		return HTTPError("error getting users: "+err.Error(), http.StatusInternalServerError)
	}
	return respond(w, models.PaginateUsers(users, page), http.StatusOK)
}

// SpecificUserHandler handles requests for a specific user
func (ctx *AuthContext) SpecificUserHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	userID, err := parseUserID(r, u)
	if err != nil {
		return err
	}
	includeInactive := getIncludeInactiveParam(r)
	switch r.Method {
	case "GET":
		if !u.CanSeeUser(userID) {
			return permissionDenied()
		}
		user, err := ctx.Database.GetUserByID(userID, includeInactive)
		if err != nil {
			return HTTPError("error looking up user: "+err.Error(), http.StatusInternalServerError)
		}
		if user == nil {
			return objectNotFound("user")
		}

		return respond(w, user, http.StatusOK)
	case "PATCH":
		if !u.CanModifyUser(userID) {
			return permissionDenied()
		}
		updates := &models.UserUpdates{}
		if err := receive(r, updates); err != nil {
			return receiveFailed()
		}
		if err := updates.CheckBioLength(); err != nil {
			return HTTPError(err.Error(), http.StatusBadRequest)
		}
		err := ctx.Database.UpdateUserByID(userID, updates, includeInactive)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		return respondWithString(w, "user updated", http.StatusOK)
	case "DELETE":
		if !u.CanDeleteUser(userID) {
			return permissionDenied()
		}
		if err := ctx.Database.DeactivateUserByID(userID); err != nil {
			if err != sql.ErrNoRows {
				return HTTPError("error deleting user: "+err.Error(), http.StatusInternalServerError)
			}
			return objectNotFound("user")
		}
		return respondWithString(w, "user has been deleted", http.StatusOK)
	default:
		return methodNotAllowed()
	}
}

// UserObjectsHandler handles requests for a specific object on a user
func (ctx *AuthContext) UserObjectsHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	userID, httperr := parseUserID(r, u)
	if httperr != nil {
		return httperr
	}
	includeDeleted := getIncludeDeletedParam(r)
	page, httperr := getPageParam(r)
	if httperr != nil {
		return httperr
	}
	objectType := mux.Vars(r)["object"]
	switch objectType {
	case "pieces":
		pieces, err := ctx.Database.GetPiecesByUserID(userID, page, includeDeleted)
		if err != nil {
			return HTTPError("error getting pieces by user id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginatePieces(pieces, page), http.StatusOK)
	case "shows":
		shows, err := ctx.Database.GetShowsByUserID(userID, page, includeDeleted, getHistoryParam(r))
		if err != nil {
			code := http.StatusInternalServerError
			if err.Error() == constants.ErrInvalidHistoryOption {
				code = http.StatusBadRequest
			}
			return HTTPError("error getting shows by user id: "+err.Error(), code)
		}
		return respond(w, models.PaginateShows(shows, page), http.StatusOK)
	case "photo":
		userID, err := parseUserID(r, u)
		if err != nil {
			return err
		}
		if r.Method == "GET" {
			if !u.CanSeeUser(userID) {
				return permissionDenied()
			}
			imageBytes, err := getUserProfilePicture(userID)
			if err != nil {
				return err
			}
			return respondWithImage(w, imageBytes, http.StatusOK)
		} else if r.Method == "POST" {
			if !u.CanModifyUser(userID) {
				return permissionDenied()
			}
			err = saveImageFromRequest(r, userID)
			if err != nil {
				return err
			}
			return respondWithString(w, "image uploaded!", http.StatusCreated)
		} else {
			return methodNotAllowed()
		}
	case "resume":
		if r.Method == "GET" {
			resumeBytes, httperr := getUserResume(userID)
			if httperr != nil {
				return httperr
			}
			return respondWithPDF(w, resumeBytes, http.StatusOK)
		} else if r.Method == "POST" {
			if httperr := saveResumeFromRequest(r, userID); httperr != nil {
				return httperr
			}
			return respondWithString(w, "resume uploaded!", http.StatusCreated)
		}
		return methodNotAllowed()
	case "announcements":
		announcements, err := ctx.Database.GetAllAnnouncements(page, includeDeleted, userID)
		if err != nil {
			return HTTPError("error looking up announcements: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginateAnnouncementResponses(announcements, page), http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}

// UserMembershipInPieceHandler handles requests to change a user's membership in a piece.
func (ctx *AuthContext) UserMembershipInPieceHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	userID, httperr := parseUserID(r, u)
	if httperr != nil {
		return httperr
	}
	pieceIDString, found := mux.Vars(r)["pieceID"]
	if !found {
		return HTTPError("no piece ID given", http.StatusBadRequest)
	}
	pieceID, err := strconv.Atoi(pieceIDString)
	if err != nil {
		return HTTPError("unparsable piece ID given: "+err.Error(), http.StatusBadRequest)
	}
	switch r.Method {
	case "LINK":
		if !u.Can(permissions.AddUserToPiece) {
			return permissionDenied()
		}
		if err := ctx.Database.AddUserToPiece(userID, pieceID); err != nil {
			return HTTPError("error adding user to piece: "+err.Error(), http.StatusInternalServerError)
		}
		return respondWithString(w, "user added", http.StatusOK)
	case "UNLINK":
		if !u.Can(permissions.RemoveUserFromPiece) {
			return permissionDenied()
		}
		if err := ctx.Database.RemoveUserFromPiece(userID, pieceID); err != nil {
			status := http.StatusInternalServerError
			if err == sql.ErrNoRows {
				status = http.StatusBadRequest
			}
			return HTTPError("error removing user from piece: user is not in this piece", status)
		}
		return respondWithString(w, "user removed", http.StatusOK)
	default:
		return methodNotAllowed()
	}
}
