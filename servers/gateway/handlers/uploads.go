package handlers

import (
	"bytes"
	"image"
	"image/jpeg"
	"image/png"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"strings"

	"github.com/nfnt/resize"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
)

// SaveImageFromRequest saves the image in the given request to the file system.
// Assumes the request is authorized.
func saveImageFromRequest(r *http.Request, userID int) *middleware.HTTPError {
	// Get the name of the field the image is in
	inputFieldName := r.Header.Get("ImageFieldName")
	if len(inputFieldName) == 0 {
		return HTTPError("no InputFieldName header provided", http.StatusBadRequest)
	}
	// parse the form to get the image
	r.ParseMultipartForm(32 << 20)
	img, fileheader, err := r.FormFile(inputFieldName)
	if err != nil {
		return HTTPError(err.Error(), http.StatusBadRequest)
	}

	// if the file size is greater than 5MB, reject it
	if fileheader.Size > appvars.ProfileUploadMaxFileSize {
		return HTTPError("filesize too large", http.StatusBadRequest)
	}

	// write the image bytes into a buffer
	imgBytesBuffer := bytes.NewBuffer(nil)
	io.Copy(imgBytesBuffer, img)

	var uploadedImage image.Image

	if strings.HasSuffix(fileheader.Filename, ".png") {
		uploadedImage, err = png.Decode(imgBytesBuffer)
	} else if strings.HasSuffix(fileheader.Filename, ".jpg") ||
		strings.HasSuffix(fileheader.Filename, ".jpeg") {
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
	resizedImage := resize.Resize(250, 0, uploadedImage, resize.Lanczos3)

	// get the user ID and create a new file for the image to be saved to.
	userIDString := strconv.Itoa(userID)
	f, err := os.OpenFile(appvars.ProfilePicturePath+userIDString+".jpg", os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return HTTPError(err.Error(), http.StatusInternalServerError)
	}
	defer f.Close()

	// encode the resized image into the newly created file
	err = jpeg.Encode(f, resizedImage, nil)
	return nil
}

// saveResumeFromRequest saves the resume that is found in the given request and
// ties it to the user with the given ID.
func saveResumeFromRequest(r *http.Request, userID int) *middleware.HTTPError {
	resumeUpload, fileheader, httperr := getUploadFromRequest(r, "ResumeFieldName")
	if httperr != nil {
		return httperr
	}
	resumeBytesBuffer := bytes.NewBuffer(nil)
	io.Copy(resumeBytesBuffer, resumeUpload)

	if !strings.HasSuffix(fileheader.Filename, ".pdf") {
		return HTTPError("unsupported file type", http.StatusBadRequest)
	}

	// get the user ID and create a new file for the resume to be saved to.
	userIDString := strconv.Itoa(userID)
	f, err := os.OpenFile(appvars.ProfileResumePath+userIDString+".pdf", os.O_WRONLY|os.O_CREATE, 0666)
	if err != nil {
		return HTTPError(err.Error(), http.StatusInternalServerError)
	}
	defer f.Close()
	io.Copy(f, resumeBytesBuffer)
	return nil
}

// getUserResume returns the bytes of the user's resume, or an HTTPError if an
// error occured.
func getUserResume(userID int) ([]byte, *middleware.HTTPError) {
	userIDString := strconv.Itoa(userID)
	resumeBytes, err := ioutil.ReadFile(appvars.ProfileResumePath + userIDString + ".pdf")
	if err != nil {
		return nil, HTTPError("user resume not found", http.StatusNotFound)
	}
	return resumeBytes, nil
}

// GetUserProfilePicture gets the profile picture associated with the given
// userID as a []byte. Returns an error if one occurred.
func getUserProfilePicture(userID int) ([]byte, *middleware.HTTPError) {
	userIDString := strconv.Itoa(userID)
	imageBytes, err := ioutil.ReadFile(appvars.ProfilePicturePath + userIDString + ".jpg")
	if err != nil {
		return nil, HTTPError("profile picture not found", http.StatusNotFound)
	}
	return imageBytes, nil
}

// getUploadFromRequest gets the upload in the field of the given request that is specified
// by the given inputHeader. Returns a file and a fileheader, or an HTTPError if an error
// occured.
func getUploadFromRequest(r *http.Request, inputHeader string) (multipart.File, *multipart.FileHeader, *middleware.HTTPError) {
	inputFieldName := r.Header.Get(inputHeader)
	if len(inputFieldName) == 0 {
		return nil, nil, HTTPError("no ResumeFieldName header provided", http.StatusBadRequest)
	}

	// parse the form to get the image
	r.ParseMultipartForm(32 << 20)
	file, fileheader, err := r.FormFile(inputFieldName)
	if err != nil {
		return nil, nil, HTTPError(err.Error(), http.StatusBadRequest)
	}
	return file, fileheader, nil
}
