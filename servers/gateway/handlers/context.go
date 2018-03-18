package handlers

import (
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/mail"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/notify"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

// AuthContext defines a list of information that
// handlers performing authentication functions will
// need
type AuthContext struct {
	SessionKey      string
	SessionsStore   sessions.Store
	store           *models.Database
	MailCredentials *mail.MailCredentials
	permChecker     *models.PermissionChecker
	TemplatePath    string
}

// NewAuthContext Creates a new auth context with the given information
func NewAuthContext(sessionKey, tp string, sessionStore sessions.Store, database *models.Database, mc *mail.MailCredentials) *AuthContext {
	return &AuthContext{
		SessionKey:      sessionKey,
		SessionsStore:   sessionStore,
		store:           database,
		MailCredentials: mc,
		permChecker:     models.NewPermissionChecker(database),
		TemplatePath:    tp,
	}
}

// AnnouncementContext defines the information needed for
// handlers performing announcement operations.
type AnnoucementContext struct {
	Store       *models.Database
	Notifier    *notify.Notifier
	permChecker *models.PermissionChecker
}

// NewAnnouncementContext returns a pointer to an AnnouncementContext
// with the given information.
func NewAnnoucementContext(store *models.Database, notifier *notify.Notifier) *AnnoucementContext {
	return &AnnoucementContext{
		Store:       store,
		Notifier:    notifier,
		permChecker: models.NewPermissionChecker(store),
	}
}

// HandlerContext defines context for non-auth related handlers.
type HandlerContext struct {
	Store *models.Database
}

// NewHandlerContext creates a new HandlerContext with the
// given arguments.
func NewHandlerContext(store *models.Database) *HandlerContext {
	return &HandlerContext{Store: store}
}

// MailContext is context used to invoke mail related handlers
// This is defined so that handlers can be invoked on a set of
// mail credentials
type MailContext mail.MailCredentials

// NewMailContext returns a new mail context from the given information
func NewMailContext(user, password string, db *models.Database) *MailContext {
	return &MailContext{
		User:        user,
		Password:    password,
		PermChecker: models.NewPermissionChecker(db),
	}
}

// AsMailCredentials returns this mail context as mail credentials
// as a full copy
func (mc *MailContext) AsMailCredentials() *mail.MailCredentials {
	return &mail.MailCredentials{
		User:     mc.User,
		Password: mc.Password,
	}
}
