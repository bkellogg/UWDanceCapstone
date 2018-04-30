package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// UserAuditionHandler handles getting the link (if it exists) between an audition and a
// user.
func (ctx *AuthContext) UserAuditionHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	targetUser, httperr := parseUserID(r, u)
	if httperr != nil {
		return httperr
	}
	if !ctx.permChecker.UserCanSeeUser(u, int64(targetUser)) {
		return permissionDenied()
	}
	vars := mux.Vars(r)
	resource := vars["object"]
	if resource != "auditions" {
		return objectTypeNotSupported()
	}
	auditionID, err := strconv.Atoi(vars["objectID"])
	if err != nil {
		return unparsableIDGiven()
	}

	ualr, dberr := ctx.store.GetUserAuditionLink(targetUser, auditionID)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return respond(w, ualr, http.StatusOK)
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
		if !ctx.permChecker.UserCan(u, permissions.ChangeUserAvailability) {
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

// addUserToAudition adds the given user to the given audition with the given UserAuditionLink
// return an HTTPError if one occurred.
func (ctx *AuthContext) addUserToAudition(userID, audID, creatorID, numShows int, ual *models.UserAuditionLink) *middleware.HTTPError {
	if dberr := ctx.store.AddUserToAudition(userID, audID, creatorID, numShows, ual.Availability, ual.Comment); dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return nil
}
