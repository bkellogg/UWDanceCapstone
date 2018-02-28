package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
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
	users, err := ctx.store.GetAllUsers(page, includeInactive)
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
		user, err := ctx.store.GetUserByID(userID, includeInactive)
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
		err := ctx.store.UpdateUserByID(userID, updates, includeInactive)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		return respondWithString(w, "user updated", http.StatusOK)
	case "DELETE":
		if !u.CanDeleteUser(userID) {
			return permissionDenied()
		}
		if err := ctx.store.DeactivateUserByID(userID); err != nil {
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
		pieces, err := ctx.store.GetPiecesByUserID(userID, page, includeDeleted)
		if err != nil {
			return HTTPError("error getting pieces by user id: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginatePieces(pieces, page), http.StatusOK)
	case "shows":
		shows, err := ctx.store.GetShowsByUserID(userID, page, includeDeleted, getHistoryParam(r))
		if err != nil {
			code := http.StatusInternalServerError
			if err.Error() == appvars.ErrInvalidHistoryOption {
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
		announcements, err := ctx.store.GetAllAnnouncements(page, includeDeleted, userID)
		if err != nil {
			return HTTPError("error looking up announcements: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginateAnnouncementResponses(announcements, page), http.StatusOK)
	default:
		return objectTypeNotSupported()
	}
}

// UserMemberShipHandler handles all requests to add or remove a user to
// an entity.
func (ctx *AuthContext) UserMemberShipHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	function := ctx.store.AddUserToAudition
	message := "user added to audition"
	vars := mux.Vars(r)
	objType := vars["object"]
	objID, err := strconv.Atoi(vars["objectID"])
	if err != nil {
		return unparsableIDGiven()
	}
	userID, httperr := parseUserID(r, u)
	if httperr != nil {
		return httperr
	}
	switch r.Method {
	case "LINK":
		if objType == "pieces" {
			function = ctx.store.AddUserToPiece
			message = "user added to piece"
		} else if objType != "auditions" {
			return objectTypeNotSupported()
		}
	case "UNLINK":
		if objType == "pieces" {
			function = ctx.store.RemoveUserFromPiece
			message = "user removed from piece"
		} else if objType == "auditions" {
			function = ctx.store.RemoveUserFromAudition
			message = "user removed from audition"
		} else {
			return objectTypeNotSupported()
		}
	default:
		return methodNotAllowed()
	}
	err = function(userID, objID)
	if err != nil {
		code := http.StatusInternalServerError
		if err == sql.ErrNoRows {
			code = http.StatusBadRequest
		} else if err.Error() == appvars.ErrPieceDoesNotExist ||
			err.Error() == appvars.ErrAuditionDoesNotExist {
			code = http.StatusNotFound
		}
		return HTTPError("error performing membership change: "+err.Error(), code)
	}
	return respondWithString(w, message, http.StatusOK)
}
