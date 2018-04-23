package startup

// RunSettings defines all of the settings and values
// needed for the gateway server to start.
type RunSettings struct {
	Host       string `ini:"HOST"`
	PORT       string `ini:"PORT"`
	UseTLS     string `ini:"USE_TLS"`
	TLSCert    string `ini:"TLS_CERT"`
	TLSKey     string `ini:"TLS_KEY"`
	SessionKey string `ini:"SESSION_KEY"`

	MySQLAddr   string `ini:"STAGE_MYSQL_ADDR"`
	MySQLUser   string `ini:"STAGE_MYSQL_USER"`
	MySQLPass   string `ini:"STAGE_MYSQL_PASS"`
	MySQLDbName string `ini:"STAGE_MYSQL_DB_NAME"`

	RedisAddr string `ini:"REDIS_ADDR"`

	MailUser string `ini:"STAGE_EMAIL_USER"`
	MailPass string `ini:"STAGE_EMAIL_PASS"`

	TemplatesPath           string `ini:"HTML_TEMPLATES_PATH"`
	ResetPasswordClientPath string `ini:"PASSWORD_RESET_CLIENT_PATH"`
	AdminConsolePath        string `ini:"ADMIN_CONSOLE_PATH"`
	AppFrontendPath         string `ini:"FRONTEND_APP_PATH"`
	AssetsPath              string `ini:"ASSETS_PATH"`

	AdminFirstName string `ini:"STAGE_ADMIN_FIRSTNAME"`
	AdminLastName  string `ini:"STAGE_ADMIN_LASTNAME"`
	AdminEmail     string `ini:"STAGE_ADMIN_EMAIL"`
	AdminPassword  string `ini:"STAGE_ADMIN_PASSWORD"`
}
