package appvars

// HTTP resource URL paths
const (
	BaseAPIPath = "/api/v1"

	UsersPath                        = BaseAPIPath + "/users"
	AllUsersPath                     = "/all"
	SpecificUserPath                 = "/{userID}"
	UserRolePath                     = SpecificUserPath + "/role"
	UserObjectsPath                  = SpecificUserPath + "/{object}"
	UserMembershipPath               = UserObjectsPath + "/{objectID}"
	UserMembershipObjectPath         = UserMembershipPath + "/{subObject}"
	UserMembershipSpecificObjectPath = UserMembershipObjectPath + "/{subObjectID}"

	SessionsPath  = BaseAPIPath + "/sessions"
	MailPath      = BaseAPIPath + "/mail"
	AuditionsPath = BaseAPIPath + "/auditions"
	ShowsPath     = BaseAPIPath + "/shows"
	PiecesPath    = BaseAPIPath + "/pieces"
	RolesPath     = BaseAPIPath + "/roles"

	ResourceRoot       = ""
	ResourceID         = "/{id}"
	ResourceIDObject   = ResourceID + "/{object}"
	ResourceIDObjectID = ResourceIDObject + "/{objectID}"
	ObjectTypesPath    = "/types"

	AnnouncementsPath = BaseAPIPath + "/announcements"

	UpdatesPath = BaseAPIPath + "/updates"

	PasswordResetPath = BaseAPIPath + "/passwordreset"
)

const (
	DefaultAppINILocation = "/config/app.ini"
)
