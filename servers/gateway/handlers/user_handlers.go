package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"

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
	if !ctx.permChecker.UserCan(u, permissions.SeeAllUsers) {
		return permissionDenied()
	}
	page, httperror := getPageParam(r)
	if httperror != nil {
		return httperror
	}
	includeInactive := getIncludeInactiveParam(r)
	users, dberr := ctx.store.GetAllUsers(page, includeInactive)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	userResponses, err := ctx.permChecker.ConvertUserSliceToUserResponseSlice(users)
	if err != nil {
		return HTTPError(err.Error(), http.StatusInternalServerError)
	}
	return respond(w, models.PaginateUserResponses(userResponses, page), http.StatusOK)
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
		if !ctx.permChecker.UserCanSeeUser(u, int64(userID)) {
			return permissionDenied()
		}
		user, dberr := ctx.store.GetUserByID(userID, includeInactive)
		if dberr != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
		}
		if user == nil {
			return objectNotFound("user")
		}

		userResponse, err := ctx.permChecker.ConvertUserToUserResponse(user)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}

		return respond(w, userResponse, http.StatusOK)
	case "PATCH":
		if !ctx.permChecker.UserCanModifyUser(u, int64(userID)) {
			return permissionDenied()
		}
		updates := &models.UserUpdates{}
		if err := receive(r, updates); err != nil {
			return err
		}
		if err := updates.CheckBioLength(); err != nil {
			return HTTPError(err.Error(), http.StatusBadRequest)
		}
		dberr := ctx.store.UpdateUserByID(userID, updates, includeInactive)
		if dberr != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
		}
		return respondWithString(w, "user updated", http.StatusOK)
	case "DELETE":
		if !!ctx.permChecker.UserCanDeleteUser(u, int64(userID)) {
			return permissionDenied()
		}
		if dberr := ctx.store.DeactivateUserByID(userID); err != nil {
			return HTTPError(dberr.Message, dberr.HTTPStatus)
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
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, models.PaginatePieces(pieces, page), http.StatusOK)
	case "shows":
		shows, err := ctx.store.GetShowsByUserID(userID, page, includeDeleted, getHistoryParam(r))
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, models.PaginateShows(shows, page), http.StatusOK)
	case "photo":
		userID, err := parseUserID(r, u)
		if err != nil {
			return err
		}
		if r.Method == "GET" {
			if !ctx.permChecker.UserCanSeeUser(u, int64(userID)) {
				return permissionDenied()
			}

			// make sure the user exists
			_, dberr := ctx.store.GetUserByID(userID, includeDeleted)
			if dberr != nil {
				return HTTPError(dberr.Message, dberr.HTTPStatus)
			}
			imageBytes, err := getUserProfilePicture(userID)
			if err != nil {
				return err
			}
			return respondWithImage(w, imageBytes, http.StatusOK)
		} else if r.Method == "POST" {
			if !ctx.permChecker.UserCanModifyUser(u, int64(userID)) {
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
	case "role":
		if !ctx.permChecker.UserCan(u, permissions.ChangeUserRole) {
			return permissionDenied()
		}
		return ctx.handleUserRole(w, r, userID)
	default:
		return objectTypeNotSupported()
	}
}

// UserMembershipActionDispatcher acts a second layer mux that filters requests about a user membership
// requests specific object types and actions.
func (ctx *AuthContext) UserMembershipActionDispatcher(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
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
	subObject := vars["subObject"]
	switch {
	case objType == "auditions" && subObject == "comments":
		return ctx.handleUserAuditionComment(userID, objID, u, w, r)
	case objType == "auditions" && subObject == "availability":
		return ctx.handleUserAuditionAvailability(userID, objID, u, w, r)
	default:
		return subObjectNotSupported()
	}
}

// UserMemberShipHandler handles all requests to add or remove a user to
// an entity.
func (ctx *AuthContext) UserMemberShipHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	function := ctx.store.RemoveUserFromPiece
	message := "user removed from piece"
	vars := mux.Vars(r)
	objType := vars["object"]
	objID, err := strconv.Atoi(vars["objectID"])
	if err != nil {
		return unparsableIDGiven()
	}
	userID, httperr := parseUserID(r, u)
	fmt.Println(userID)
	if httperr != nil {
		return httperr
	}

	switch r.Method {
	case "LINK":
		if objType == "auditions" {
			if !ctx.permChecker.UserCanAddToAudition(u, int64(userID)) {
				return permissionDenied()
			}
			numShows, err := getNumShowsParam(r)
			if err != nil {
				return HTTPError("number of shows is not a valid number", http.StatusBadRequest)
			}
			if numShows < 1 || numShows > 2 {
				return HTTPError("number of shows must be 1 or 2", http.StatusBadRequest)
			}
			ual := &models.UserAuditionLink{}
			if err := receive(r, ual); err != nil {
				return err
			}
			if httperr := ctx.addUserToAudition(userID, objID, int(u.ID), numShows, ual); httperr != nil {
				return httperr
			}
			return respondWithString(w, "user added to audition", http.StatusOK)
		} else if objType == "pieces" {
			if !ctx.permChecker.UserCan(u, permissions.AddUserToPiece) {
				return permissionDenied()
			}
			err := ctx.store.AddUserToPiece(userID, objID)
			if err != nil {
				return HTTPError(err.Message, err.HTTPStatus)
			}
			return respondWithString(w, "user added to piece", http.StatusOK)
		} else {
			return objectTypeNotSupported()
		}
	case "UNLINK":
		if objType == "pieces" {
			if !ctx.permChecker.UserCan(u, permissions.RemoveUserFromPiece) {
				return permissionDenied()
			}
			function = ctx.store.RemoveUserFromPiece
			message = "user removed from piece"
		} else if objType == "auditions" {
			if !ctx.permChecker.UserCan(u, permissions.RemoveUserFromAudition) {
				return permissionDenied()
			}
			function = ctx.store.RemoveUserFromAudition
			message = "user removed from audition"
		} else {
			return objectTypeNotSupported()
		}
	default:
		return methodNotAllowed()
	}
	dberr := function(userID, objID)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return respondWithString(w, message, http.StatusOK)
}

// handleUserRole handles all requests to change a user's role.
func (ctx *AuthContext) handleUserRole(w http.ResponseWriter, r *http.Request, userID int) *middleware.HTTPError {
	if r.Method != "PATCH" {
		return methodNotAllowed()
	}
	roleChange := &models.RoleChange{}
	if err := receive(r, roleChange); err != nil {
		return err
	}
	err := ctx.store.ChangeUserRole(userID, roleChange.RoleName)
	if err != nil {
		if err == sql.ErrNoRows {
			return HTTPError("user not found", http.StatusNotFound)
		}
		return HTTPError("error changing user role: "+err.Error(), http.StatusInternalServerError)
	}
	return respondWithString(w, "user role updated", http.StatusOK)
}
