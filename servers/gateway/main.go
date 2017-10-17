package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"

	_ "github.com/go-sql-driver/mysql"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/constants"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/handlers"

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
	db := openMySQLConnectionOrExit("root", mySQLPass, mySQLAddr, mySQLDBName)
	redis := sessions.NewRedisStore(nil, constants.DefaultSessionDuration, redisAddr)

	ensureUsersTableOrExit(db, mySQLDBName)

	authContext := handlers.NewAuthContext(sessionKey, redis, db)

	standardMux := http.NewServeMux()

	standardMux.HandleFunc(constants.TestPath, authContext.TestHandler)

	log.Printf("Gateway listening at %s...\n", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCert, tlsKey, standardMux))
}

// Gets the value of env from the environment or defaults it to the given
// def. Exits the process if env and def are not set
func getRequiredENVOrExit(env, def string) string {
	if envVal := os.Getenv(env); len(envVal) != 0 {
		return envVal
	} else if len(def) != 0 {
		log.Printf("no value for %s, defaulting to %s\n", env, def)
		return def
	}
	log.Fatalf("no value for %s and no default set. Please set a value for %s\n", env, env)
	return ""
}

// opens a connection to the mysql database with the given credentials
// fatally logs if there was an error opening the connection
func openMySQLConnectionOrExit(user, password, addr, dbName string) *sql.DB {
	db, err := sql.Open("mysql", fmt.Sprintf("%s:%s@tcp(%s)/%s", user, password, addr, dbName))
	if err != nil {
		log.Fatal("error opening connection to mysql: " + err.Error())
	}
	err = db.Ping()
	if err != nil {
		log.Fatal("error opening connection to mysql: " + err.Error())
	}
	return db
}

// ensure that the given sql db has a Users table
// fatally logs if there was an error creating the table
func ensureUsersTableOrExit(db *sql.DB, dbName string) {
	_, err := db.Exec("SELECT 1 FROM Users LIMIT 1")
	if err != nil {
		log.Println(dbName + ".Users does not exist; creating...")
		_, err := db.Exec(`CREATE TABLE Users (
									UserID INT AUTO_INCREMENT PRIMARY KEY,
									UserName VARCHAR(25) NOT NULL,
									FirstName VARCHAR(50) NOT NULL,
									LastName VARCHAR(50) NOT NULL,
									PassHash VARCHAR(50) NOT NULL,
									Role INT NOT NULL
								)`)
		if err != nil {
			log.Fatal("error creating Users table: " + err.Error())
		}
		log.Printf("successfully created %s.Users\n", dbName)
	}
}
