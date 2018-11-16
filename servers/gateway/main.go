package main

import (
	"crypto/tls"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/startup"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/handlers"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/notify"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

const UseAppINI = false

func main() {

	if UseAppINI {
		settings, err := startup.ParseSettingsFromINI("")
		if err != nil {
			log.Fatalf("error parsing settings from ini: %v", err)
		}
		fmt.Println("successfully loaded app settings!")
		fmt.Printf("%+v", settings)
	}

	// Gateway server environment variables
	addr := require("ADDR", ":443")
	httpRedirAddr := require("HTTPREDIRADDR", ":80")
	tlsKey := require("TLSKEY")
	tlsCert := require("TLSCERT")
	sessionKey := require("SESSIONKEY")

	// MYSQL store environment variables
	mySQLPass := require("MYSQLPASS")
	mySQLAddr := require("MYSQLADDR")
	mySQLDBName := require("MYSQLDBNAME", "DanceDB")

	// Redis store environment variables
	redisAddr := require("REDISADDR")

	// Mail Info
	mailUser := require("MAILUSER")
	mailPass := require("MAILPASS")

	templatesPath := require("TEMPLATESPATH")
	resetPasswordClientPath := require("RESETPASSWORDCLIENTPATH")
	adminConsolePath := require("ADMINCONSOLEPATH")
	frontEndPath := require("FRONTENDPATH")
	assetsPath := require("ASSETSPATH")
	termsPath := require("TERMSPATH")

	// determine if the app should be started in DEBUG mode
	isDebug := require("STAGE_DEBUG", "false") == "true"
	if isDebug {
		log.Println("debug mode enabled")
	}

	// admin user info
	adminFName := require("STAGE_ADMIN_FIRSTNAME")
	adminLName := require("STAGE_ADMIN_LASTNAME")
	adminEmail := require("STAGE_ADMIN_EMAIL")
	adminPaswd := require("STAGE_ADMIN_PASSWORD")

	// URL that the app is served from
	// this will be used when generating links back to itself.
	url := require("STAGE_HOST", "stage.dance.uw.edu")
	appvars.StageURL = "https://" + url

	// Open connections to the databases
	db, err := models.NewDatabase("root", mySQLPass, mySQLAddr, mySQLDBName)
	if err != nil {
		log.Fatalf("error connecting to database: %v", err)
	}

	if err = db.BootstrapInitialAdminUser(adminFName, adminLName, adminEmail, adminPaswd); err != nil {
		log.Fatalf("error bootstrapping initial admin user: %v", err)
	}

	redis := sessions.NewRedisStore(nil, appvars.DefaultSessionDuration, redisAddr)

	notifier := notify.NewNotifier()
	castingSession := notify.NewCastingSession(db, notifier)

	permChecker, err := models.NewPermissionChecker(db)
	if err != nil {
		log.Fatalf("error creating permission checker: %v", err)
	}

	mailContext := handlers.NewMailContext(mailUser, mailPass, permChecker)
	authContext := handlers.NewAuthContext(sessionKey, templatesPath, redis, db, mailContext.AsMailCredentials(), permChecker)
	announcementContext := handlers.NewAnnouncementContext(db, notifier, permChecker)
	authorizer := middleware.NewHandlerAuthorizer(sessionKey, redis)

	castingContext := handlers.NewCastingContext(permChecker,
		castingSession,
		templatesPath+"confirmation_tpl.html",
		mailContext.AsMailCredentials(),
		isDebug)

	baseRouter := middleware.NewAuthenticatedRouter(sessionKey, redis)
	baseRouter.Handle(appvars.MailPath, authorizer.Authorize(mailContext.MailHandler))
	baseRouter.HandleFunc(appvars.SessionsPath, authContext.UserSignInHandler)
	baseRouter.HandleFunc(appvars.PasswordResetPath, authContext.PasswordResetHandler)
	baseRouter.PathPrefix("/reset/").Handler(handlers.PreventDirListing(http.StripPrefix("/reset/", http.FileServer(http.Dir(resetPasswordClientPath)))))
	baseRouter.PathPrefix("/admin").Handler(handlers.AddTrailingSlash(http.StripPrefix("/admin/", http.FileServer(http.Dir(adminConsolePath)))))
	baseRouter.PathPrefix("/terms").Handler(handlers.AddTrailingSlash(http.StripPrefix("/terms/", http.FileServer(http.Dir(termsPath)))))
	baseRouter.PathPrefix("/assets/tpl/").Handler(http.NotFoundHandler()) // don't serve the assets/tpl directory
	baseRouter.PathPrefix("/assets/").Handler(handlers.PreventDirListing(http.StripPrefix("/assets/", http.FileServer(http.Dir(assetsPath)))))
	baseRouter.PathPrefix(appvars.BaseAPIPath + "/flushcasting").Handler(authorizer.Authorize(castingContext.FlushCastingHandler)).
		Methods(http.MethodDelete)
	baseRouter.PathPrefix(appvars.BaseAPIPath + "/castingstate").Handler(authorizer.Authorize(castingContext.DebugCastingStateHandler)).
		Methods(http.MethodGet)

	updatesRouter := baseRouter.PathPrefix(appvars.UpdatesPath).Subrouter()
	updatesRouter.Handle(appvars.ResourceRoot, notify.NewWebSocketsHandler(notifier, redis, sessionKey))

	announcementsRouter := baseRouter.PathPrefix(appvars.AnnouncementsPath).Subrouter()
	announcementsRouter.Handle(appvars.ObjectTypesPath, authorizer.Authorize(authContext.AnnouncementTypesHandler))
	announcementsRouter.Handle(appvars.ResourceID, authorizer.Authorize(announcementContext.SpecificAnnouncementHandler))
	announcementsRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(announcementContext.AnnouncementsHandler))
	announcementsRouter.Handle("/dummy", authorizer.Authorize(announcementContext.DummyAnnouncementHandler))

	usersRouter := baseRouter.PathPrefix(appvars.UsersPath).Subrouter()
	usersRouter.HandleFunc(appvars.ResourceRoot, authContext.UserSignUpHandler)
	usersRouter.Handle(appvars.AllUsersPath, authorizer.Authorize(authContext.AllUsersHandler))
	usersRouter.Handle(appvars.SpecificUserPath, authorizer.Authorize(authContext.SpecificUserHandler))
	usersRouter.Handle(appvars.UserObjectsPath, authorizer.Authorize(authContext.UserObjectsHandler))
	usersRouter.Handle(appvars.UserMembershipPath, authorizer.Authorize(authContext.UserMemberShipHandler)).
		Methods("LINK", "UNLINK", "DELETE")
	usersRouter.Handle(appvars.UserMembershipPath, authorizer.Authorize(authContext.UserObjectDispatcher))
	usersRouter.Handle(appvars.UserMembershipObjectPath, authorizer.Authorize(authContext.UserMembershipActionDispatcher))

	auditionRouter := baseRouter.PathPrefix(appvars.AuditionsPath).Subrouter()
	auditionRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.AuditionsHandler))
	auditionRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificAuditionHandler))
	auditionRouter.Handle(appvars.ResourceIDObject, authorizer.Authorize(castingContext.CastingHandlerDispatcher)).
		Methods(http.MethodPut, http.MethodPatch, http.MethodPost)
	auditionRouter.Handle(appvars.ResourceIDObject, authorizer.Authorize(authContext.AuditionObjectDispatcher))

	showRouter := baseRouter.PathPrefix(appvars.ShowsPath).Subrouter()
	showRouter.Handle(appvars.ObjectTypesPath, authorizer.Authorize(authContext.ShowTypeHandler))
	showRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.ShowsHandler))
	showRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificShowHandler))
	showRouter.Handle(appvars.ResourceIDObject, authorizer.Authorize(authContext.ShowObjectDispatcher))
	showRouter.Handle(appvars.ResourceIDObjectID, authorizer.Authorize(authContext.ShowAuditionRelationshipHandler)).
		Methods("LINK", "UNLINK")

	pieceRouter := baseRouter.PathPrefix(appvars.PiecesPath).Subrouter()
	pieceRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.PiecesHandler))
	pieceRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificPieceHandler))
	pieceRouter.Handle(appvars.ResourceIDObject, authorizer.Authorize(authContext.PieceObjectHandler))
	pieceRouter.Handle(appvars.ResourceIDObjectID, authorizer.Authorize(authContext.PieceObjectIDHandler))

	rolesRouter := baseRouter.PathPrefix(appvars.RolesPath).Subrouter()
	rolesRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.RolesHandler))
	rolesRouter.Handle(appvars.ResourceRoot+"/", authorizer.Authorize(authContext.RolesHandler))
	rolesRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificRoleHandler))

	baseRouter.Handle(appvars.BaseAPIPath, http.NotFoundHandler())
	baseRouter.PathPrefix("/static").Handler(http.StripPrefix("/static", http.FileServer(http.Dir(frontEndPath+"static/"))))
	baseRouter.PathPrefix("/").HandlerFunc(handlers.IndexHandler(frontEndPath)).Methods(http.MethodGet)

	treatedRouter := middleware.EnsureHeaders(middleware.BlockIE(
		middleware.LogErrors(
			baseRouter, db)))

	// redirect HTTP requests to HTTPS when appropriate
	// this needs to be done since the gateway server will need to
	// be responsible for serving the web client due to hardware
	// limitations of this project
	http.HandleFunc("/", handlers.HTTPSRedirectHandler)
	log.Printf("HTTP Redirect server is listen at http://%s\n", httpRedirAddr)
	go http.ListenAndServe(httpRedirAddr, nil)

	// define an http server with specific settings
	// that are safer when using the go http server
	// directly on the web.
	server := http.Server{
		Addr:    addr,
		Handler: treatedRouter,
		TLSConfig: &tls.Config{
			PreferServerCipherSuites: true,
			CurvePreferences: []tls.CurveID{
				tls.CurveP256,
				tls.X25519,
			},
			MinVersion: tls.VersionTLS12,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384,
				tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305,
				tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305,
				tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256,
			},
		},
		ReadHeaderTimeout: time.Second * 5,
		ReadTimeout:       time.Second * 5,
		WriteTimeout:      time.Second * 10,
		IdleTimeout:       time.Second * 120,
	}

	log.Printf("Gateway server is listen at https://%s...\n", addr)
	if !strings.HasSuffix(addr, ":443") {
		log.Println("WARNING: Gateway server listening on non-standard HTTPS port. HTTP Redirects only work when standard HTTP/S ports.")
	}
	log.Fatal(server.ListenAndServeTLS(tlsCert, tlsKey))
}

// Gets the value of env from the environment or defaults it to the given
// def. Exits the process if env and def are not set
func require(env string, def ...string) string {
	if len(def) > 1 {
		return ""
	}
	defVal := ""
	if len(def) > 0 {
		defVal = def[0]
	}
	if envVal := os.Getenv(env); len(envVal) != 0 {
		return envVal
	}
	if len(def) != 0 {
		log.Printf("no value for %s, defaulting to %s\n", env, defVal)
		return defVal
	}
	log.Fatalf("no value for %s and no default set. Please set a value for %s\n", env, env)
	return ""
}
