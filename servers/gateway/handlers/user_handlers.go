package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

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
	if !ctx.permChecker.UserCan(u, permissions.SeeAllUsers) {
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
		user, err := ctx.store.GetUserByID(userID, includeInactive)
		if err != nil {
			return HTTPError("error looking up user: "+err.Error(), http.StatusInternalServerError)
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
		err := ctx.store.UpdateUserByID(userID, updates, includeInactive)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		return respondWithString(w, "user updated", http.StatusOK)
	case "DELETE":
		if !!ctx.permChecker.UserCanDeleteUser(u, int64(userID)) {
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

// handleUserAuditionAvailability handles requests related to availability on a User Audition
func (ctx *AuthContext) handleUserAuditionAvailability(userID, audID int, u *models.User, w http.ResponseWriter, r *http.Request) *middleware.HTTPError {
	switch r.Method {
	case "GET":
		if !ctx.permChecker.UserCanSeeAvailability(u, int64(userID)) {
			return permissionDenied()
		}
		avail, err := ctx.store.GetUserAuditionAvailability(userID, audID)
		if err != nil {
			code := http.StatusInternalServerError
			if err.Error() == appvars.ErrUserAuditionDoesNotExist {
				code = http.StatusBadRequest
			}
			return HTTPError(err.Error(), code)
		}
		return respond(w, avail, http.StatusOK)
	case "PATCH":
		if !!ctx.permChecker.UserCan(u, permissions.ChangeUserAvailability) {
			return permissionDenied()
		}
		wtb := &models.WeekTimeBlock{}
		if err := receive(r, wtb); err != nil {
			return err
		}
		if err := ctx.store.UpdateUserAuditionAvailability(userID, audID, wtb); err != nil {
			code := http.StatusInternalServerError
			if err.Error() == appvars.ErrUserAuditionDoesNotExist ||
				strings.Contains(err.Error(), "validation failed") {
				code = http.StatusBadRequest
			}
			return HTTPError(err.Error(), code)
		}
		return respondWithString(w, "availability updated", http.StatusOK)
	default:
		return methodNotAllowed()
	}
	return nil
}

// handleUserAuditionComment handles requests related to comments on a User Audition
func (ctx *AuthContext) handleUserAuditionComment(userID, audID int, u *models.User, w http.ResponseWriter, r *http.Request) *middleware.HTTPError {
	switch r.Method {
	case "POST":
		if !ctx.permChecker.UserCan(u, permissions.CommentOnUserAudition) {
			return permissionDenied()
		}
		newComment := &models.AuditionComment{}
		if err := receive(r, newComment); err != nil {
			return err
		}
		comment, err := ctx.store.InsertUserAuditionComment(userID, audID, int(u.ID), newComment.Comment)
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, comment, http.StatusCreated)
	case "GET":
		if !ctx.permChecker.UserCan(u, permissions.SeeCommentsOnUserAudition) {
			return permissionDenied()
		}
		includeDeleted := getIncludeDeletedParam(r)
		page, httperr := getPageParam(r)
		if httperr != nil {
			return httperr
		}
		creator, httperr := getCreatorParam(r)
		if httperr != nil {
			return httperr
		}
		comments, err := ctx.store.GetUserAuditionComments(userID, audID, creator, page, includeDeleted)
		if err != nil {
			return HTTPError(err.Message, err.HTTPStatus)
		}
		return respond(w, models.PaginateUserAuditionComments(comments, page), http.StatusOK)
	default:
		return methodNotAllowed()
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
			ual := &models.UserAuditionLink{}
			if err := receive(r, ual); err != nil {
				return err
			}
			if httperr := ctx.addUserToAudition(userID, objID, int(u.ID), ual); httperr != nil {
				return httperr
			}
			return respondWithString(w, "user added to audition", http.StatusOK)
		} else if objType == "pieces" {
			if !ctx.permChecker.UserCan(u, permissions.AddUserToPiece) {
				return permissionDenied()
			}
			role := getRoleParam(r)
			switch role {
			case appvars.RoleChoreographer:
				if !ctx.permChecker.UserCan(u, permissions.AddStaffToPiece) {
					return permissionDenied()
				}
			case "":
				role = appvars.RoleDancer
			default:
				return HTTPError(role+" is not a valid role", http.StatusBadRequest)
			}
			err := ctx.store.AddUserToPiece(userID, objID, role)
			if err != nil {
				return HTTPError(err.Message, err.HTTPStatus)
			}
			return respondWithString(w, "user added to piece as a(n) "+role, http.StatusOK)
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

// addUserToAudition adds the given user to the given audition with the given UserAuditionLink
// return an HTTPError if one occurred.
func (ctx *AuthContext) addUserToAudition(userID, audID, creatorID int, ual *models.UserAuditionLink) *middleware.HTTPError {
	if err := ctx.store.AddUserToAudition(userID, audID, creatorID, ual.Availability, ual.Comment); err != nil {
		code := http.StatusInternalServerError
		if err.Error() == appvars.ErrAuditionDoesNotExist || err.Error() == appvars.ErrUserAlreadyInAudition {
			code = http.StatusBadRequest
		}
		return HTTPError("error performing membership change: "+err.Error(), code)
	}
	return nil
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
