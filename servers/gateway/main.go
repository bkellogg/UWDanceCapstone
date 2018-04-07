package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/startup"
	"github.com/gorilla/mux"

	_ "github.com/go-sql-driver/mysql"

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
	addr := getRequiredENVOrExit("ADDR", ":443")
	httpRedirAddr := getRequiredENVOrExit("HTTPREDIRADDR", ":80")
	tlsKey := getRequiredENVOrExit("TLSKEY", "")
	tlsCert := getRequiredENVOrExit("TLSCERT", "")
	sessionKey := getRequiredENVOrExit("SESSIONKEY", "")

	// MYSQL store environment variables
	mySQLPass := getRequiredENVOrExit("MYSQLPASS", "")
	mySQLAddr := getRequiredENVOrExit("MYSQLADDR", "")
	mySQLDBName := getRequiredENVOrExit("MYSQLDBNAME", "DanceDB")

	// Redis store environment variables
	redisAddr := getRequiredENVOrExit("REDISADDR", "")

	// Mail Info
	mailUser := getRequiredENVOrExit("MAILUSER", "")
	mailPass := getRequiredENVOrExit("MAILPASS", "")

	templatesPath := getRequiredENVOrExit("TEMPLATESPATH", "")
	resetPasswordClientPath := getRequiredENVOrExit("RESETPASSWORDCLIENTPATH", "")
	adminConsolePath := getRequiredENVOrExit("ADMINCONSOLEPATH", "")
	frontEndPath := getRequiredENVOrExit("FRONTENDPATH", "")
	assetsPath := getRequiredENVOrExit("ASSETSPATH", "")

	// admin user info
	adminFName := getRequiredENVOrExit("STAGE_ADMIN_FIRSTNAME", "")
	adminLName := getRequiredENVOrExit("STAGE_ADMIN_LASTNAME", "")
	adminEmail := getRequiredENVOrExit("STAGE_ADMIN_EMAIL", "")
	adminPaswd := getRequiredENVOrExit("STAGE_ADMIN_PASSWORD", "")

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

	permChecker, err := models.NewPermissionChecker(db)
	if err != nil {
		log.Fatalf("error creating permission checker: %v", err)
	}

	mailContext := handlers.NewMailContext(mailUser, mailPass, permChecker)
	authContext := handlers.NewAuthContext(sessionKey, templatesPath, redis, db, mailContext.AsMailCredentials(), permChecker)
	announcementContext := handlers.NewAnnouncementContext(db, notifier, permChecker)
	authorizer := middleware.NewHandlerAuthorizer(sessionKey, authContext.SessionsStore)

	baseRouter := mux.NewRouter()
	baseRouter.Handle(appvars.MailPath, authorizer.Authorize(mailContext.MailHandler))
	baseRouter.HandleFunc(appvars.SessionsPath, authContext.UserSignInHandler)
	baseRouter.HandleFunc(appvars.PasswordResetPath, authContext.PasswordResetHandler)
	baseRouter.PathPrefix("/reset/").Handler(handlers.PreventDirListing(http.StripPrefix("/reset/", http.FileServer(http.Dir(resetPasswordClientPath)))))
	baseRouter.PathPrefix("/admin").Handler(handlers.AddTrailingSlash(http.StripPrefix("/admin/", http.FileServer(http.Dir(adminConsolePath)))))
	baseRouter.PathPrefix("/assets/tpl/").Handler(http.NotFoundHandler()) // don't serve the assets/tpl directory
	baseRouter.PathPrefix("/assets/").Handler(handlers.PreventDirListing(http.StripPrefix("/assets/", http.FileServer(http.Dir(assetsPath)))))

	updatesRouter := baseRouter.PathPrefix(appvars.UpdatesPath).Subrouter()
	updatesRouter.Handle(appvars.ResourceRoot, notify.NewWebSocketsHandler(notifier, redis, sessionKey))

	announcementsRouter := baseRouter.PathPrefix(appvars.AnnouncementsPath).Subrouter()
	announcementsRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(announcementContext.AnnouncementsHandler))
	announcementsRouter.Handle(appvars.ObjectTypesPath, authorizer.Authorize(authContext.AnnouncementTypesHandler))
	announcementsRouter.Handle("/dummy", authorizer.Authorize(announcementContext.DummyAnnouncementHandler))

	usersRouter := baseRouter.PathPrefix(appvars.UsersPath).Subrouter()
	usersRouter.HandleFunc(appvars.ResourceRoot, authContext.UserSignUpHandler)
	usersRouter.Handle(appvars.AllUsersPath, authorizer.Authorize(authContext.AllUsersHandler))
	usersRouter.Handle(appvars.SpecificUserPath, authorizer.Authorize(authContext.SpecificUserHandler))
	usersRouter.Handle(appvars.UserObjectsPath, authorizer.Authorize(authContext.UserObjectsHandler))
	usersRouter.Handle(appvars.UserMembershipPath, authorizer.Authorize(authContext.UserMemberShipHandler)).Methods("LINK", "UNLINK")
	usersRouter.Handle(appvars.UserMembershipObjectPath, authorizer.Authorize(authContext.UserMembershipActionDispatcher))

	auditionRouter := baseRouter.PathPrefix(appvars.AuditionsPath).Subrouter()
	auditionRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.AuditionsHandler))
	auditionRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificAuditionHandler))
	auditionRouter.Handle(appvars.ResourceIDObject, authorizer.Authorize(authContext.ResourceForSpecificAuditionHandler))

	showRouter := baseRouter.PathPrefix(appvars.ShowsPath).Subrouter()
	showRouter.Handle(appvars.ObjectTypesPath, authorizer.Authorize(authContext.ShowTypeHandler))
	showRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.ShowsHandler))
	showRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificShowHandler))
	showRouter.Handle(appvars.ResourceIDObject, authorizer.Authorize(authContext.ResourceForSpecificShowHandler))

	pieceRouter := baseRouter.PathPrefix(appvars.PiecesPath).Subrouter()
	pieceRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.PiecesHandler))
	pieceRouter.Handle(appvars.ResourceID, authorizer.Authorize(authContext.SpecificPieceHandler))
	pieceRouter.Handle(appvars.ResourceIDObjectID, authorizer.Authorize(authContext.PieceChoreographerHandler))

	rolesRouter := baseRouter.PathPrefix(appvars.RolesPath).Subrouter()
	rolesRouter.Handle(appvars.ResourceRoot, authorizer.Authorize(authContext.RolesHandler))

	baseRouter.Handle(appvars.BaseAPIPath, http.NotFoundHandler())
	baseRouter.PathPrefix("/static").Handler(http.StripPrefix("/static", http.FileServer(http.Dir(frontEndPath+"static/"))))
	baseRouter.PathPrefix("/").HandlerFunc(handlers.IndexHandler(frontEndPath + "index.html"))

	treatedRouter := middleware.EnsureHeaders(middleware.BlockIE(
		middleware.LogErrors(baseRouter, db)))

	// redirect HTTP requests to HTTPS when appropriate
	// this needs to be done since the gateway server will need to
	// be responsible for serving the web client due to hardware
	// limitations of this project
	http.HandleFunc("/", handlers.HTTPSRedirectHandler)
	log.Printf("HTTP Redirect server is listen at http://%s\n", httpRedirAddr)
	go http.ListenAndServe(httpRedirAddr, nil)

	log.Printf("Gateway server is listen at https://%s...\n", addr)
	if !strings.HasSuffix(addr, ":443") {
		log.Println("WARNING: Gateway server listening on non-standard HTTPS port. HTTP Redirects only work when standard HTTP/S ports.")
	}
	log.Fatal(http.ListenAndServeTLS(addr, tlsCert, tlsKey, treatedRouter))
}

// Gets the value of env from the environment or defaults it to the given
// def. Exits the process if env and def are not set
func getRequiredENVOrExit(env, def string) string {
	if envVal := os.Getenv(env); len(envVal) != 0 {
		return envVal
	}
	if len(def) != 0 {
		log.Printf("no value for %s, defaulting to %s\n", env, def)
		return def
	}
	log.Fatalf("no value for %s and no default set. Please set a value for %s\n", env, env)
	return ""
}
