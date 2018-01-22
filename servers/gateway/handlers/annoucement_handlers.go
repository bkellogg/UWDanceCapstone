package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// AnnoucementsHandler handles requests related to annoucements.
func (ctx *AnnoucementContext) AnnoucementsHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "POST":
		if !u.Can(permissions.SendAnnoucements) {
			return permissionDenied()
		}

		na := &models.NewAnnoucement{}
		if err := recieve(r, na); err != nil {
			return HTTPError(err.Error(), http.StatusBadRequest)
		}
		na.UserID = u.ID
		annoucement, err := ctx.Store.InsertNewAnnouncment(na)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}

		wsa := &models.WebSocketAnnoucement{
			ID:       annoucement.ID,
			PostDate: annoucement.PostDate,
			User:     u,
			Message:  annoucement.Message,
		}

		wsaBytes, err := json.Marshal(wsa)
		if err != nil {
			return HTTPError("error marshalling annoucement: "+err.Error(), http.StatusInternalServerError)
		}
		ctx.Notifier.Notify(wsaBytes)
		return respond(w, annoucement, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}
