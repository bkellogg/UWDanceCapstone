package constants

const (
	BaseAPIPath = "/api/v1"

	UsersPath        = BaseAPIPath + "/users"
	AllUsersPath     = UsersPath + "/all"
	UsersMePath      = UsersPath + "/me"
	SpecificUserPath = UsersPath + "/{id}"

	SessionsPath  = BaseAPIPath + "/sessions"
	MailPath      = BaseAPIPath + "/mail"
	AuditionsPath = BaseAPIPath + "/auditions"
	ShowsPath     = BaseAPIPath + "/shows"
	PiecesPath    = BaseAPIPath + "/pieces"

	ResourceRoot     = ""
	ResourceID       = "/{id}"
	ResourceIDObject = ResourceID + "/{object}"
)
