package constants

const (
	BaseAPIPath = "/api/v1"

	UsersPath                 = BaseAPIPath + "/users"
	AllUsersPath              = "/all"
	SpecificUserPath          = "/{userID}"
	UserObjectsPath           = SpecificUserPath + "/{object}"
	UserMembershipInPiecePath = SpecificUserPath + "/pieces" + "/{pieceID}"

	SessionsPath  = BaseAPIPath + "/sessions"
	MailPath      = BaseAPIPath + "/mail"
	AuditionsPath = BaseAPIPath + "/auditions"
	ShowsPath     = BaseAPIPath + "/shows"
	PiecesPath    = BaseAPIPath + "/pieces"

	ResourceRoot     = ""
	ResourceID       = "/{id}"
	ResourceIDObject = ResourceID + "/{object}"
)
