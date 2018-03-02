package handlers

import (
	"net/http"
	"time"

	"github.com/Pallinder/go-randomdata"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/notify"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/permissions"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// AnnoucementsHandler handles requests related to annoucements resource.
func (ctx *AnnoucementContext) AnnoucementsHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	switch r.Method {
	case "GET":
		if !u.Can(permissions.SeeAnnouncements) {
			return permissionDenied()
		}
		page, httperr := getPageParam(r)
		if httperr != nil {
			return httperr
		}
		includeDeleted := getIncludeDeletedParam(r)
		announcements, err := ctx.Store.GetAllAnnouncements(page, includeDeleted, -1)
		if err != nil {
			return HTTPError("error looking up announcements: "+err.Error(), http.StatusInternalServerError)
		}
		return respond(w, models.PaginateAnnouncementResponses(announcements, page), http.StatusOK)
	case "POST":
		if !u.Can(permissions.SendAnnouncements) {
			return permissionDenied()
		}

		na := &models.NewAnnouncement{}
		if err := receive(r, na); err != nil {
			return HTTPError(err.Error(), http.StatusBadRequest)
		}
		na.UserID = u.ID
		annoucement, err := ctx.Store.InsertNewAnnouncment(na)
		if err != nil {
			return HTTPError(err.Error(), http.StatusInternalServerError)
		}
		wse, err := notify.NewWebSocketEvent(notify.EventTypeAnnouncement,
			annoucement.AsAnnouncementResponse(u))
		if err != nil {
			return HTTPError("error creating web socket announcement: "+err.Error(), http.StatusInternalServerError)
		}
		ctx.Notifier.Notify(wse)
		return respond(w, annoucement, http.StatusCreated)
	default:
		return methodNotAllowed()
	}
}

// DummyAnnouncementHandler handles requests made to make a dummy annoucement. Creates a dummy
// announcement and sends it over the context's notifier.
func (ctx *AnnoucementContext) DummyAnnouncementHandler(w http.ResponseWriter, r *http.Request, u *models.User) *middleware.HTTPError {
	if !u.Can(permissions.SendAnnouncements) {
		return permissionDenied()
	}
	dummyUser := &models.User{
		FirstName: randomdata.FirstName(randomdata.RandomGender),
		LastName:  randomdata.LastName(),
		Email:     randomdata.Email(),
		Role:      randomdata.Number(0, 100),
		Active:    true,
	}
	wsa := &models.AnnouncementResponse{
		ID:        0,
		CreatedAt: time.Now(),
		CreatedBy: dummyUser,
		Message:   randomdata.Letters(randomdata.Number(10, 75)),
		IsDeleted: false,
	}
	wse, err := notify.NewWebSocketEvent(notify.EventTypeAnnouncement, wsa)
	if err != nil {
		return HTTPError("error creating web socket announcement: "+err.Error(), http.StatusInternalServerError)
	}
	ctx.Notifier.Notify(wse)
	return respondWithString(w,
		"Randomly generated annoucement send over the announcement websocket. This announcement was not persisted to the database",
		http.StatusCreated)
}
