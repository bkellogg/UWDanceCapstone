package main

import (
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/handlers"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
)

func main() {
	// Gateway server environment variables
	addr := getRequiredENVOrExit("ADDR", ":443")
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

	// Open connections to the databases
	db, err := models.NewDatabase("root", mySQLPass, mySQLAddr, mySQLDBName)
	if err != nil {
		log.Fatalf("error connecting to database: %v", err)
	}
	redis := sessions.NewRedisStore(nil, constants.DefaultSessionDuration, redisAddr)

	authContext := handlers.NewAuthContext(sessionKey, redis, db)
	mailContext := handlers.NewMailContext(mailUser, mailPass)
	authorizer := middleware.NewHandlerAuthorizer(sessionKey, authContext.SessionsStore)

	standardMux := http.NewServeMux()
	standardMux.HandleFunc(constants.UsersPath, authContext.UserSignUpHandler)
	standardMux.HandleFunc(constants.SessionsPath, authContext.UserSignInHandler)

	// Handlers that require an authenticated user
	standardMux.Handle(constants.AllUsersPath, authorizer.Authorize(authContext.AllUsersHandler))
	standardMux.Handle(constants.SpecificUserPath, authorizer.Authorize(authContext.SpecificUserHandler))
	standardMux.Handle(constants.MailPath, authorizer.Authorize(mailContext.MailHandler))
	standardMux.Handle(constants.AuditionsPath, authorizer.Authorize(authContext.AuditionsHandler))

	loggedMux := middleware.NewLogger(standardMux, db)

	log.Printf("Gateway listening at %s...\n", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCert, tlsKey, loggedMux))
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
