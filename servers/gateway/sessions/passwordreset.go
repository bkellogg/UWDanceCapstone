package sessions

import (
	"errors"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"math/rand"
	"strconv"
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
	token := ""
	for i := 0; i < 30; i++ {
		token += strconv.Itoa(rand.Intn(10))
	}

	if err := rs.Client.Set(passwordResetPrefix+email,
		token, constants.PasswordResetValidityDuration).Err(); err != nil {
		return "", err
	}
	return token, nil
}

// ValidatePasswordResetToken validates that the given token exists for the given
// email. Returns an error if no such token exists, or there was an error validating it.
func (rs *RedisStore) ValidatePasswordResetToken(email, token string) error {
	cmd := rs.Client.Get(passwordResetPrefix + email)
	err := cmd.Err()
	if err != nil {
		return err
	}
	storedToken := cmd.String()
	if token != storedToken {
		return errors.New(constants.ErrPasswordResetTokensMismatch)
	}
	return nil
}
