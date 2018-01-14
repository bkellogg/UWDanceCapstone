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

// getPageFromRequest gets the value of the page query parameter
// used in pagination. Returns an error if one occured.
func getPageParam(r *http.Request) (int, *middleware.HTTPError) {
	pageParam := r.URL.Query().Get("page")
	if len(pageParam) == 0 {
		return 1, nil
	}
	page, err := strconv.Atoi(pageParam)
	if err != nil {
		return 0, HTTPError("unparsable page number given", http.StatusBadRequest)
	}
	return page, nil
}

// getIncludeInactiveParam returns true if the includeInactive param is true,
// false if otherwise.
func getIncludeInactiveParam(r *http.Request) bool {
	includeInactiveParam := r.URL.Query().Get("includeInactive")
	if includeInactiveParam == "true" {
		return true
	}
	return false
}
