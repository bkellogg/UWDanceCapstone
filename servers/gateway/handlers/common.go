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
