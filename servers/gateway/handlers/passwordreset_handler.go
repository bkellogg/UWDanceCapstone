package handlers

import (
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

// PasswordResetHandler handles requests that will initiate a password reset.
func (ctx *AuthContext) PasswordResetHandler(w http.ResponseWriter, r *http.Request) {
	email := getEmailParam(r)
	if len(email) == 0 {
		http.Error(w, "no email provided", http.StatusBadRequest)
		return
	}
	user, err := ctx.store.GetUserByEmail(email, false)
	if err != nil {
		http.Error(w, appvars.ErrDatabaseLookupFailed, http.StatusInternalServerError)
		return
	}
	switch r.Method {
	case "GET":
		validResetRequest := true
		if user == nil {
			validResetRequest = false
		}
		if validResetRequest {
			token, err := ctx.SessionsStore.NewPasswordResetToken(email)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
				return
			}
			tplVars := models.PasswordResetTPL{
				Name: user.FirstName,
				URL:  appvars.StageURL + "/reset/reset.html?email=" + email + "&token=" + token,
			}
			msg, err := mail.NewMessageFromTemplate(ctx.MailCredentials,
				ctx.TemplatePath+"passwordreset_tpl.html",
				appvars.PasswordResetEmailSubject, tplVars,
				asSlice(email))
			if err != nil {
				http.Error(w, "error generating email: "+err.Error(), http.StatusInternalServerError)
				return
			}
			if err = msg.Send(); err != nil {
				http.Error(w, "error sending email: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
		respondWithString(w, "password reset instructions will be sent to the provided email if it exists", http.StatusOK)
	case "PATCH":
		reset := &models.PasswordResetRequest{}
		if err := receive(r, reset); err != nil {
			http.Error(w, err.Message, err.Status)
			return
		}
		if ok, err := ctx.SessionsStore.ValidatePasswordResetToken(email, reset.Token); !ok {
			status := http.StatusInternalServerError
			if err.Error() == appvars.ErrPasswordResetTokensMismatch {
				status = http.StatusUnauthorized
			}
			http.Error(w, err.Error(), status)
			return
		}
		if ok, err := sessions.ValidatePasswords(reset.Password, reset.PasswordConf); !ok {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		if err := user.SetPassword(reset.Password); err != nil {
			http.Error(w, "error changing password: "+err.Error(), http.StatusInternalServerError)
			return
		}
		if err := ctx.store.UpdatePasswordByID(int(user.ID), user.PassHash); err != nil {
			http.Error(w, "error saving new password: "+err.Error(), http.StatusInternalServerError)
			return
		}
		respondWithString(w, appvars.StatusPasswordResetSuccessful, http.StatusOK)
	default:
		http.Error(w, appvars.ErrMethodNotAllowed, http.StatusMethodNotAllowed)
	}

}

// asSlice returns the given string as a slice
// with the only element being the given string.
func asSlice(email string) []string {
	return append([]string{}, email)
}
