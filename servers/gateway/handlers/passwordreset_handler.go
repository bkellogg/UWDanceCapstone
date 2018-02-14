package handlers

import (
	"fmt"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"net/http"
)

// InitiatePasswordResetHandler handles requests that will initiate a password reset.
func (ctx *AuthContext) InitiatePasswordResetHandler(w http.ResponseWriter, r *http.Request) {
	email := getEmailParam(r)
	if len(email) == 0 {
		http.Error(w, "no email provided", http.StatusBadRequest)
		return
	}

	validResetRequest := true
	user, err := ctx.Database.GetUserByEmail(email, false)
	if err != nil {
		http.Error(w, constants.ErrDatabaseLookupFailed, http.StatusInternalServerError)
		return
	}
	if user == nil {
		validResetRequest = false
	}
	token, err := ctx.SessionsStore.NewPasswordResetToken(email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	if validResetRequest {
		if err = mail.NewMessage(ctx.MailCredentials, constants.StageEmailAddress, getPasswordResetBody(user.FirstName, token),
			constants.PasswordResetEmailSubject, asSlice(email)).Send(); err != nil {
			http.Error(w, "error sending password reset email: "+err.Error(), http.StatusInternalServerError)
			return
		}
	}
	respondWithString(w, "password reset instructions will be sent to the provided email if it exists", http.StatusOK)

}

func asSlice(email string) []string {
	return append([]string{}, email)
}

func getPasswordResetBody(name, token string) string {
	body := fmt.Sprintf("Hello %s,\n\n", name)
	body += fmt.Sprintf(`We received a request to reset you password. If this was you then please use the link below

`)
	body += fmt.Sprintf(`%s

`, token)
	body += fmt.Sprintf(`If you did not make this request then you can disgreard this email. Your password will remain unchanged.`)
	return body
}
