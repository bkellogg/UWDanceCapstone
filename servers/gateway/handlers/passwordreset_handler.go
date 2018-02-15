package handlers

import (
	"fmt"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/templates"
	"net/http"
)

// PasswordResetHandler handles requests that will initiate a password reset.
func (ctx *AuthContext) PasswordResetHandler(w http.ResponseWriter, r *http.Request) {
	email := getEmailParam(r)
	if len(email) == 0 {
		http.Error(w, "no email provided", http.StatusBadRequest)
		return
	}
	user, err := ctx.Database.GetUserByEmail(email, false)
	if err != nil {
		http.Error(w, constants.ErrDatabaseLookupFailed, http.StatusInternalServerError)
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
				Code: token,
			}
			parsedTpl, err := templates.ParseTemplate(ctx.TemplatePath+"passwordreset_tpl.html", tplVars)
			if err != nil {
				http.Error(w, "error pasrsing email tpl: "+err.Error(), http.StatusInternalServerError)
				return
			}
			if err = mail.NewMessage(ctx.MailCredentials, constants.StageEmailAddress,
				parsedTpl,
				constants.PasswordResetEmailSubject, asSlice(email)).Send(); err != nil {
				http.Error(w, "error sending password reset email: "+err.Error(), http.StatusInternalServerError)
				return
			}
		}
		respondWithString(w, "password reset instructions will be sent to the provided email if it exists", http.StatusOK)
	case "PATCH":
		reset := &models.PasswordResetRequest{}
		if err := recieve(r, reset); err != nil {
			http.Error(w, "error decoding request JSON: "+err.Error(), http.StatusBadRequest)
			return
		}
		if ok, err := ctx.SessionsStore.ValidatePasswordResetToken(email, reset.Token); !ok {
			status := http.StatusInternalServerError
			if err.Error() == constants.ErrPasswordResetTokensMismatch {
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
		if err := ctx.Database.UpdatePasswordByID(int(user.ID), user.PassHash); err != nil {
			http.Error(w, "error saving new password: "+err.Error(), http.StatusInternalServerError)
			return
		}
		respondWithString(w, "password change success; please use the new password next time you sign in", http.StatusOK)
	default:
		http.Error(w, constants.ErrMethodNotAllowed, http.StatusMethodNotAllowed)
	}

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
