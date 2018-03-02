package appvars

const (
	BaseAPIPath = "/api/v1"

	UsersPath          = BaseAPIPath + "/users"
	AllUsersPath       = "/all"
	SpecificUserPath   = "/{userID}"
	UserObjectsPath    = SpecificUserPath + "/{object}"
	UserMembershipPath = UserObjectsPath + "/{objectID}"

	SessionsPath  = BaseAPIPath + "/sessions"
	MailPath      = BaseAPIPath + "/mail"
	AuditionsPath = BaseAPIPath + "/auditions"
	ShowsPath     = BaseAPIPath + "/shows"
	PiecesPath    = BaseAPIPath + "/pieces"

	ResourceRoot     = ""
	ResourceID       = "/{id}"
	ResourceIDObject = ResourceID + "/{object}"
	ObjectTypesPath  = "/types"

	AnnoucementsPath = BaseAPIPath + "/announcements"

	UpdatesPath = BaseAPIPath + "/updates"

	PasswordResetPath = BaseAPIPath + "/passwordreset"
)
