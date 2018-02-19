package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"

	_ "github.com/go-sql-driver/mysql"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/handlers"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/notify"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

func main() {
	// Gateway server environment variables
	addr := getRequiredENVOrExit("ADDR", ":443")
	httpRedirAddr := getRequiredENVOrExit("HTTPREDIRADDR", ":80")
	tlsKey := getRequiredENVOrExit("TLSKEY", "")
	tlsCert := getRequiredENVOrExit("TLSCERT", "")
	sessionKey := getRequiredENVOrExit("SESSIONKEY", "")

	// MYSQL Database environment variables
	mySQLPass := getRequiredENVOrExit("MYSQLPASS", "")
	mySQLAddr := getRequiredENVOrExit("MYSQLADDR", "")
	mySQLDBName := getRequiredENVOrExit("MYSQLDBNAME", "DanceDB")

	// Redis Database environment variables
	redisAddr := getRequiredENVOrExit("REDISADDR", "")

	// Mail Info
	mailUser := getRequiredENVOrExit("MAILUSER", "")
	mailPass := getRequiredENVOrExit("MAILPASS", "")
	templatesPath := getRequiredENVOrExit("TEMPLATESPATH", "")

	resetPasswordClientPath := getRequiredENVOrExit("RESETPASSWORDCLIENTPATH", "")
	adminConsolePath := getRequiredENVOrExit("ADMINCONSOLEPATH", "")

	// Open connections to the databases
	db, err := models.NewDatabase("root", mySQLPass, mySQLAddr, mySQLDBName)
	if err != nil {
		log.Fatalf("error connecting to database: %v", err)
	}
	redis := sessions.NewRedisStore(nil, constants.DefaultSessionDuration, redisAddr)

	notifier := notify.NewNotifier()

	mailContext := handlers.NewMailContext(mailUser, mailPass)
	authContext := handlers.NewAuthContext(sessionKey, templatesPath, redis, db, mailContext.AsMailCredentials())
	annoucementContext := handlers.NewAnnoucementContext(db, notifier)
	authorizer := middleware.NewHandlerAuthorizer(sessionKey, authContext.SessionsStore)

	baseRouter := mux.NewRouter()
	baseRouter.Handle(constants.MailPath, authorizer.Authorize(mailContext.MailHandler))
	baseRouter.HandleFunc(constants.SessionsPath, authContext.UserSignInHandler)
	baseRouter.HandleFunc(constants.PasswordResetPath, authContext.PasswordResetHandler)
	baseRouter.PathPrefix("/reset/").Handler(handlers.PreventDirListing(http.StripPrefix("/reset/", http.FileServer(http.Dir(resetPasswordClientPath)))))
	baseRouter.PathPrefix("/console").Handler(handlers.AddTrailingSlash(http.StripPrefix("/console/", http.FileServer(http.Dir(adminConsolePath)))))

	updatesRouter := baseRouter.PathPrefix(constants.UpdatesPath).Subrouter()
	updatesRouter.Handle(constants.ResourceRoot, notify.NewWebSocketsHandler(notifier, redis, sessionKey))

	annoucementsRouter := baseRouter.PathPrefix(constants.AnnoucementsPath).Subrouter()
	annoucementsRouter.Handle(constants.ResourceRoot, authorizer.Authorize(annoucementContext.AnnoucementsHandler))
	annoucementsRouter.Handle("/dummy", authorizer.Authorize(annoucementContext.DummyAnnouncementHandler))

	usersRouter := baseRouter.PathPrefix(constants.UsersPath).Subrouter()
	usersRouter.HandleFunc(constants.ResourceRoot, authContext.UserSignUpHandler)
	usersRouter.Handle(constants.AllUsersPath, authorizer.Authorize(authContext.AllUsersHandler))
	usersRouter.Handle(constants.SpecificUserPath, authorizer.Authorize(authContext.SpecificUserHandler))
	usersRouter.Handle(constants.UserObjectsPath, authorizer.Authorize(authContext.UserObjectsHandler))
	usersRouter.Handle(constants.UserMembershipInPiecePath, authorizer.Authorize(authContext.UserMembershipInPieceHandler))

	auditionRouter := baseRouter.PathPrefix(constants.AuditionsPath).Subrouter()
	auditionRouter.Handle(constants.ResourceRoot, authorizer.Authorize(authContext.AuditionsHandler))
	auditionRouter.Handle(constants.ResourceID, authorizer.Authorize(authContext.SpecificAuditionHandler))
	auditionRouter.Handle(constants.ResourceIDObject, authorizer.Authorize(authContext.ResourceForSpecificAuditionHandler))

	showRouter := baseRouter.PathPrefix(constants.ShowsPath).Subrouter()
	showRouter.Handle(constants.ResourceRoot, authorizer.Authorize(authContext.ShowsHandler))                       // /api/v1/shows
	showRouter.Handle(constants.ResourceID, authorizer.Authorize(authContext.SpecificShowHandler))                  // /api/v1/shows/{showID}
	showRouter.Handle(constants.ResourceIDObject, authorizer.Authorize(authContext.ResourceForSpecificShowHandler)) // /api/v1/shows/{showID}/{object}

	pieceRouter := baseRouter.PathPrefix(constants.PiecesPath).Subrouter()
	pieceRouter.Handle(constants.ResourceRoot, authorizer.Authorize(authContext.PiecesHandler))
	pieceRouter.Handle(constants.ResourceID, authorizer.Authorize(authContext.SpecificPieceHandler))

	treatedRouter := middleware.EnsureHeaders(
		middleware.LogErrors(baseRouter, db))

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
