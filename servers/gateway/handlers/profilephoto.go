package handlers

import (
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
)

// SaveImageFromRequest saves the image in the given request to the file system.
// Assumes the request is authorized.
func SaveImageFromRequest(r *http.Request, userID int) *middleware.HTTPError {
	inputFieldName := r.Header.Get("InputFieldName")
	if len(inputFieldName) == 0 {
		return HTTPError("No InputFieldName header provided", http.StatusBadRequest)
	}
	r.ParseMultipartForm(32 << 20)
	image, _, err := r.FormFile(inputFieldName)
	if err != nil {
		return HTTPError(err.Error(), http.StatusBadRequest)
	}
	userIDString := strconv.Itoa(userID)
	f, err := os.OpenFile("/images/"+userIDString+".jpg", os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return HTTPError(err.Error(), http.StatusInternalServerError)
	}
	defer f.Close()
	io.Copy(f, image)
	return nil
}

func GetUserProfilePicture(userID int) ([]byte, error) {
	userIDString := strconv.Itoa(userID)
	imageBytes, err := ioutil.ReadFile("/images/" + userIDString + ".jpg")
	if err != nil {
		return nil, err
	}
	return imageBytes, nil
}
