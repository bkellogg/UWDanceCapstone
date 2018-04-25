package permissions

// Randomly picked numbers for testing purposes.
const (
	SendMail = 50

	SeeAllUsers               = 10
	ModifyUsers               = 70
	ChangeUserRole            = 100
	DeleteUsers               = 70
	AddUserToPiece            = 70
	AddStaffToPiece           = 75
	RemoveUserFromPiece       = 70
	AddUserToAudition         = 70
	RemoveUserFromAudition    = 70
	CommentOnUserAudition     = 70
	SeeCommentsOnUserAudition = 20

	SeeUserAvailability    = 70
	ChangeUserAvailability = 100

	SeeAuditions    = 10
	CreateAuditions = 70
	DeleteAuditions = 70
	ModifyAuditions = 70

	SeeShows    = 10
	CreateShows = 70
	DeleteShows = 70

	SeePieces    = 10
	CreatePieces = 70
	DeletePieces = 70

	ModifyShowAuditionRelationship = 100

	SendAnnouncements       = 70
	SeeAnnouncements        = 10
	SeeAnnouncementTypes    = SeeAnnouncements
	CreateAnnouncementTypes = 80

	SeeShowTypes    = 10
	CreateShowTypes = 75
)
