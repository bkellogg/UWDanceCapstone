package sessions

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
)

//InvalidSessionID represents an empty, invalid session ID
const InvalidSessionID SessionID = ""

//idLength is the length of the ID portion
const idLength = 32

//signedLength is the full length of the signed session ID
//(ID portion plus signature)
const signedLength = idLength + sha256.Size

type SessionID string

//ErrInvalidID is returned when an invalid session id is passed to ValidateID()
var ErrInvalidID = errors.New("Invalid Session ID")

//NewSessionID creates and returns a new digitally-signed session ID,
//using `signingKey` as the HMAC signing key. An error is returned only
//if there was an error generating random bytes for the session ID
func NewSessionID(signingKey string) (SessionID, error) {
	if len(signingKey) == 0 {
		return InvalidSessionID, errors.New("signingKey must have a length greater than 0")
	}

	//  the result as a SessionID type
	session := make([]byte, signedLength)
	_, err := rand.Read(session[:idLength])
	if err != nil {
		return InvalidSessionID, err
	}

	h := hmac.New(sha256.New, []byte(signingKey))
	h.Write(session[:idLength])
	sig := h.Sum(nil)
	copy(session[idLength:], sig)

	return SessionID(base64.URLEncoding.EncodeToString(session)), nil
}

//ValidateID validates the string in the `id` parameter
//using the `signingKey` as the HMAC signing key
//and returns an error if invalid, or a SessionID if valid
func ValidateID(id string, signingKey string) (SessionID, error) {

	buffer, err := base64.URLEncoding.DecodeString(id)
	if err != nil {
		return InvalidSessionID, err
	}

	sigID := buffer[idLength:]
	hash := hmac.New(sha256.New, []byte(signingKey))
	hash.Write(buffer[:idLength])
	sigHMAC := hash.Sum(nil)

	if hmac.Equal(sigID, sigHMAC) {
		return SessionID(id), nil
	}
	return InvalidSessionID, ErrInvalidID
}

//String returns a string representation of the sessionID
func (sid SessionID) String() string {
	return string(sid)
}
