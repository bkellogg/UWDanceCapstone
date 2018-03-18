package handlers

import (
	"net/http"
	"strconv"

	"github.com/gorilla/mux"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// ObjectForSpecificResourceHandler handles requests for a specific object under a specific resource.
// Handles requests for /api/v1/{resource}/{resourceID}/{object}/{objectID}
// Ex.LINK to /api/v1/users/1234/pieces/4321
func (ctx *HandlerContext) ObjectForSpecificResourceHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	// TODO: Not sure if this is the approach to this that should be taken
	// tabling for now.

	return nil

	// rType, rID := getResourceTypeAndID(r)
	// oType, oID := getObjectTypeAndID(r)
	// switch rType {
	// case "users":
	// case "auditions":
	// case "shows":
	// case "pieces":
	// default:
	// 	return resourceDoesNotExist()
	// }
}

// getResourceTypeAndID gets the resource type and its ID.
func getResourceTypeAndID(r *http.Request) (string, int) {
	return parseTargetTypeAndID(r, "resource")
}

// getObjectTypeAndID gets the object type and its ID.
func getObjectTypeAndID(r *http.Request) (string, int) {
	return parseTargetTypeAndID(r, "object")
}

// parseTargetTypeAndID gets the type of the target and the intended target's ID
// as an int, if it exists.
func parseTargetTypeAndID(r *http.Request, target string) (string, int) {
	vars := mux.Vars(r)
	targetType := vars[target]
	targetIDString := vars[target+"ID"]
	targetID, err := strconv.Atoi(targetIDString)
	if err != nil {
		return targetType, -1
	}
	return targetType, targetID
}

// parseUserID gets the userID as an int from the requets and user.
func parseUserID(r *http.Request, u *models.User) (int, *middleware.HTTPError) {
	userIDString, found := mux.Vars(r)["userID"]
	if !found {
		return 0, HTTPError("no user ID given", http.StatusBadRequest)
	}
	var userID int
	var err error
	if userIDString == "me" {
		userID = int(u.ID)
	} else {
		userID, err = strconv.Atoi(userIDString)
		if err != nil {
			return 0, HTTPError("unparsable user ID given: "+err.Error(), http.StatusBadRequest)
		}
	}
	return userID, nil
}

// getIntParam gets the given param from the given request as an int.
// returns an HTTPError if an error occurred.
func getIntParam(r *http.Request, param string) (int, *middleware.HTTPError) {
	paramVal := r.URL.Query().Get(param)
	if len(paramVal) == 0 {
		return 0, nil
	}
	page, err := strconv.Atoi(paramVal)
	if err != nil {
		return -1, HTTPError("unparsable page number given", http.StatusBadRequest)
	}
	return page, nil
}

// getPageFromRequest gets the value of the page query parameter
// used in pagination. Returns an error if one occurred.
func getPageParam(r *http.Request) (int, *middleware.HTTPError) {
	page, err := getIntParam(r, "page")
	if page == 0 {
		page = 1
	}
	return page, err
}

// getCreatorParam gets the value of the creator query parameter as an int.
// Returns an HTTPError if an error occurred.
func getCreatorParam(r *http.Request) (int, *middleware.HTTPError) {
	return getIntParam(r, "creator")
}

// getIncludeInactiveParam returns true if the includeInactive param is true,
// false if otherwise.
func getIncludeInactiveParam(r *http.Request) bool {
	return r.URL.Query().Get("includeInactive") == "true"
}

// getIncludeDeletedParam returns true if the includeInactive param is true,
// false if otherwise.
func getIncludeDeletedParam(r *http.Request) bool {
	return r.URL.Query().Get("includeDeleted") == "true"
}

// getTypeParam returns the value of the "type" param in the given request.
func getTypeParam(r *http.Request) string {
	return r.URL.Query().Get("type")
}

// getEmailParam returns the value of the email param in the given request.
func getEmailParam(r *http.Request) string {
	return r.URL.Query().Get("email")
}

// getHistoryParam returns the value of the email param in the given request.
func getHistoryParam(r *http.Request) string {
	return r.URL.Query().Get("history")
}

// getStringParam gets the value of the given param from the given
// request as a string.
func getStringParam(r *http.Request, param string) string {
	return r.URL.Query().Get(param)
}

// getRole gets the value of the role query parameter.
func getRoleParam(r *http.Request) string {
	return getStringParam(r, "role")
}
