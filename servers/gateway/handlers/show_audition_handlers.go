package handlers

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"
	"github.com/gorilla/mux"
)

// ShowAuditionRelationshipHandler handles requests to modify a specific audition in relation
// to a show.
func (ctx *AuthContext) ShowAuditionRelationshipHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	vars := mux.Vars(r)
	object := vars["object"]
	if object != "auditions" {
		return objectTypeNotSupported()
	}
	showID, err := strconv.Atoi(vars["id"])
	if err != nil {
		return unparsableIDGiven()
	}
	audID, err := strconv.Atoi(vars["objectID"])
	if err != nil {
		return unparsableIDGiven()
	}
	if !ctx.permChecker.UserCan(u, permissions.ModifyShowAuditionRelationship) {
		return permissionDenied()
	}

	var assigning bool // whether or not we are assigning or unassigning the audition from the show
	var message string // message to report back

	switch r.Method {
	case "LINK":
		assigning = true
		message = fmt.Sprintf("audition id '%d' is now associated with show id '%d'", audID, showID)
	case "UNLINK":
		assigning = false
		message = fmt.Sprintf("audition id '%d' is no longer associated with show id '%d'", audID, showID)
	default:
		return methodNotAllowed()
	}

	dberr := ctx.store.ModifyShowAuditionRelationship(showID, audID, assigning)
	if dberr != nil {
		return HTTPError(dberr.Message, dberr.HTTPStatus)
	}
	return respondWithString(w, message, http.StatusOK)
}
