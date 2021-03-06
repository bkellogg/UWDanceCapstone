package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

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
		return -1, HTTPError(fmt.Sprintf("unparsable %s number given", param), http.StatusBadRequest)
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

// getNumShowsParam gets the value of the shows query parameter
func getNumShowsParam(r *http.Request) (int, error) {
	return strconv.Atoi(getStringParam(r, "shows"))
}

// getIDsParam parses a comma delimited list on ints
// at the ids query param
func getIDsParam(r *http.Request) ([]int, error) {
	idsString := getStringParam(r, "ids")
	if len(idsString) == 0 {
		return nil, nil
	}
	idsSlice := strings.Split(strings.Replace(idsString, " ", "", -1), ",")
	res := make([]int, 0, len(idsSlice))
	for _, idString := range idsSlice {
		id, err := strconv.Atoi(idString)
		if err != nil {
			return nil, err
		}
		res = append(res, id)
	}
	return res, nil
}
