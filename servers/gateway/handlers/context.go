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
func NewAuthContext(sessionKey, tp string, sessionStore sessions.Store, database *models.Database, mc *mail.MailCredentials, pc *models.PermissionChecker) *AuthContext {
	return &AuthContext{
		SessionKey:      sessionKey,
		SessionsStore:   sessionStore,
		store:           database,
		MailCredentials: mc,
		permChecker:     pc,
		TemplatePath:    tp,
	}
}

// AnnouncementContext defines the information needed for
// handlers performing announcement operations.
type AnnouncementContext struct {
	Store       *models.Database
	Notifier    *notify.Notifier
	permChecker *models.PermissionChecker
}

// NewAnnouncementContext returns a pointer to an AnnouncementContext
// with the given information.
func NewAnnouncementContext(store *models.Database, notifier *notify.Notifier, pc *models.PermissionChecker) *AnnouncementContext {
	return &AnnouncementContext{
		Store:       store,
		Notifier:    notifier,
		permChecker: pc,
	}
}

// CastingContext defines information needed for
// handlers that handle casting requests.
type CastingContext struct {
	permChecker *models.PermissionChecker
	Session     *notify.CastingSession
}

// NewCastingContext returns a new CastingContext
// from the given inputs.
func NewCastingContext(pc *models.PermissionChecker,
	session *notify.CastingSession) *CastingContext {
	return &CastingContext{
		permChecker: pc,
		Session:     session,
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
func NewMailContext(user, password string, pc *models.PermissionChecker) *MailContext {
	return &MailContext{
		User:        user,
		Password:    password,
		PermChecker: pc,
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
