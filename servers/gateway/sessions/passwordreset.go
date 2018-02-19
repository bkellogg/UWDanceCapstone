package sessions

import (
	"crypto/rand"
	"encoding/base64"
	"errors"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"strings"
)

// passwordResetPrefix is a prefix that will be used for all keys stored
// in the redis store in order to prevent collisions when storing password
// reset tokens.
const passwordResetPrefix = "pwr:"

// NewPasswordResetToken generates a new password reset token for the given email and
// saves it to this redis store for the time specified by PasswordResetValidityDuration
func (rs *RedisStore) NewPasswordResetToken(email string) (string, error) {
	if len(email) == 0 {
		return "", errors.New("email cannot be 0 length")
	}
	randomBytes := make([]byte, constants.PasswordResetTokenLength)
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", errors.New("error generating password reset token")
	}

	token := base64.StdEncoding.EncodeToString(randomBytes)

	if err := rs.Client.Set(passwordResetPrefix+email,
		token, constants.PasswordResetValidityDuration).Err(); err != nil {
		return "", err
	}
	return token, nil
}

// ValidatePasswordResetToken validates that the given token exists for the given
// email. Returns an error if no such token exists, or there was an error validating it.
func (rs *RedisStore) ValidatePasswordResetToken(email, token string) (bool, error) {
	cmd := rs.Client.Get(passwordResetPrefix + email)
	err := cmd.Err()
	if err != nil {
		return false, errors.New(constants.ErrPasswordResetTokensMismatch)
	}
	storedTokenBytes, _ := cmd.Bytes()
	storedToken := string(storedTokenBytes)
	storedToken = strings.TrimPrefix(storedToken, passwordResetPrefix)
	if token != storedToken {
		return false, errors.New(constants.ErrPasswordResetTokensMismatch)
	}
	rs.Client.Del(passwordResetPrefix + email)
	return true, nil
}

// ValidatePasswords returns true if the password and passwordConf
// combination are valid, false and an error if otherwise.
func ValidatePasswords(password, passwordConf string) (bool, error) {
	if len(password) < constants.PasswordMinLength {
		return false, errors.New(constants.ErrPasswordNotLongEnough)
	}
	if password != passwordConf {
		return false, errors.New(constants.ErrPasswordsMismatch)
	}
	return true, nil
}
