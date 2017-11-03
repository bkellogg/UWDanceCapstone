package main

import (
	"database/sql"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/handlers"

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

	// Open connections to the databases
	db, err := models.NewDatabase("root", mySQLPass, mySQLAddr, mySQLDBName)
	if err != nil {
		log.Fatalf("error connecting to database: %v", err)
	}
	defer db.DB.Close()
	ensureUsersTableOrExit(db.DB, mySQLDBName)

	redis := sessions.NewRedisStore(nil, constants.DefaultSessionDuration, redisAddr)

	authContext := handlers.NewAuthContext(sessionKey, redis, db)

	standardMux := http.NewServeMux()
	standardMux.HandleFunc(constants.UsersPath, authContext.UserSignUpHandler)
	standardMux.HandleFunc(constants.SessionsPath, authContext.UserSignInHandler)

	log.Printf("Gateway listening at %s...\n", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCert, tlsKey, standardMux))
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

// ensure that the given sql db has a Users table
// fatally logs if there was an error creating the table
// This function is here to speed up testing with auth during
// development. Will come out later
func ensureUsersTableOrExit(db *sql.DB, dbName string) {
	_, err := db.Exec("SELECT 1 FROM Users LIMIT 1")
	if err != nil {
		log.Println(dbName + ".Users does not exist; creating...")
		// Temp DB Structure
		_, err := db.Exec(`CREATE TABLE Users (
									UserID INT AUTO_INCREMENT PRIMARY KEY,
									FirstName VARCHAR(50) NOT NULL,
									LastName VARCHAR(50) NOT NULL,
									Email VARCHAR(100) NOT NULL,
									PassHash BINARY(60) NOT NULL,
									Role VARCHAR(3) NOT NULL
								)`)
		if err != nil {
			log.Fatal("error creating Users table: " + err.Error())
		}
		log.Printf("successfully created %s.Users\n", dbName)
	}
}
