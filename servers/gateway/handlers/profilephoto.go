package handlers

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/nfnt/resize"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
)

// SaveImageFromRequest saves the image in the given request to the file system.
// Assumes the request is authorized.
func SaveImageFromRequest(r *http.Request, userID int) *middleware.HTTPError {
	// Get the name of the field the image is in
	inputFieldName := r.Header.Get("InputFieldName")
	if len(inputFieldName) == 0 {
		return HTTPError("No InputFieldName header provided", http.StatusBadRequest)
	}
	// parse the form to get the image
	r.ParseMultipartForm(32 << 20)
	img, fileheader, err := r.FormFile(inputFieldName)
	if err != nil {
		return HTTPError(err.Error(), http.StatusBadRequest)
	}

	// if the file size is greater than 5MB, reject it
	if fileheader.Size > constants.ProfilePictureMaxFileSize {
		return HTTPError("filesize too large", http.StatusInternalServerError)
	}

	// write the image bytes into a buffer
	imgBytesBuffer := bytes.NewBuffer(nil)
	io.Copy(imgBytesBuffer, img)

	var uploadedImage image.Image

	if strings.HasSuffix(fileheader.Filename, ".png") {
		uploadedImage, err = png.Decode(imgBytesBuffer)
	} else if strings.HasSuffix(fileheader.Filename, ".jpg") {
		uploadedImage, err = jpeg.Decode(imgBytesBuffer)
	} else {
		return HTTPError("unsupported file type", http.StatusBadRequest)
	}
	if err != nil {
		return HTTPError(err.Error(), http.StatusInternalServerError)
	}

	// clear the bytes in the imgBytesBuffer since we no longer
	// need them
	imgBytesBuffer.Reset()

	// resize the image to 600x600
	resizedImage := resize.Resize(500, 0, uploadedImage, resize.Lanczos3)

	// get the user ID and create a new file for the image to be saved to.
	userIDString := strconv.Itoa(userID)
	f, err := os.OpenFile(constants.ProfilePicturePath+userIDString+".jpg", os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return HTTPError(err.Error(), http.StatusInternalServerError)
	}
	defer f.Close()

	// encode the resized image into the newly created file
	err = jpeg.Encode(f, resizedImage, nil)
	return nil
}

// GetUserProfilePicture gets the profile picture associated with the given
// userID as a []byte. Returns an error if one occurred.
func GetUserProfilePicture(userID int) ([]byte, error) {
	userIDString := strconv.Itoa(userID)
	imageBytes, err := ioutil.ReadFile(constants.ProfilePicturePath + userIDString + ".jpg")
	if err != nil {
		return nil, err
	}
	return imageBytes, nil
}
