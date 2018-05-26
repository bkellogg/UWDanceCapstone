package models

// PaginatedUsers defines the object that is written
// back to the client for requests that can contain multiple
// pages of users.
type PaginatedUsers struct {
	Page  int     `json:"page"`
	Users []*User `json:"users"`
}

// PaginateUsers returns the given slice of users and the page
// as a PaginatedUsers struct.
func PaginateUsers(users []*User, page int) *PaginatedUsers {
	return &PaginatedUsers{
		Users: users,
		Page:  page,
	}
}

// PaginatedUserResponses defines the object that is written
// back to the client for requests that can contain multiple
// pages of UserResponse.
type PaginatedUserResponses struct {
	Page     int             `json:"page"`
	NumPages int             `json:"numPages,omitempty"`
	Users    []*UserResponse `json:"users"`
}

// PaginateUsers returns the given slice of users and the page
// as a PaginatedUsers struct.
func PaginateUserResponses(users []*UserResponse, page int) *PaginatedUserResponses {
	return &PaginatedUserResponses{
		Users: users,
		Page:  page,
	}
}

// PaginateNumUsers returns the given slice of users and the page
// as a PaginatedUsers struct.
func PaginateNumUserResponses(users []*UserResponse, page, numPages int) *PaginatedUserResponses {
	return &PaginatedUserResponses{
		Users:    users,
		Page:     page,
		NumPages: numPages,
	}
}

// PaginatedAuditions defines the object that is written
// back to the client for requests that can contain multiple
// pages of auditions.
type PaginatedAuditions struct {
	Page      int         `json:"page"`
	Auditions []*Audition `json:"auditions"`
}

// PaginateAuditions returns the given slice of auditions and the page
// as a PaginatedAuditions struct.
func PaginateAuditions(auditions []*Audition, page int) *PaginatedAuditions {
	return &PaginatedAuditions{
		Auditions: auditions,
		Page:      page,
	}
}

// PaginatedShows defines the object that is written
// back to the client for requests that can contain multiple
// pages of shows.
type PaginatedShows struct {
	Page  int     `json:"page"`
	Shows []*Show `json:"shows"`
}

// PaginateShows returns the given slice of shows and the page
// as a PaginatedShows struct.
func PaginateShows(shows []*Show, page int) *PaginatedShows {
	return &PaginatedShows{
		Shows: shows,
		Page:  page,
	}
}

// PaginatedPieces defines the object that is written
// back to the client for requests that can contain multiple
// pages of pieces.
type PaginatedPieces struct {
	Page   int      `json:"page"`
	Pieces []*Piece `json:"pieces"`
}

// PaginatePieces returns the given slice of pieces and the page
// as a PaginatedPieces struct.
func PaginatePieces(pieces []*Piece, page int) *PaginatedPieces {
	return &PaginatedPieces{
		Pieces: pieces,
		Page:   page,
	}
}

// PaginatedAnnouncementResponses defines the object that is written
// back to the client for requests that can contain multiple
// pages of announcements.
type PaginatedAnnouncementResponses struct {
	Page          int                     `json:"page"`
	NumPages      int                     `json:"numPages,omitempty"`
	Announcements []*AnnouncementResponse `json:"announcements"`
}

// PaginateAnnouncementResponses returns the given slice of pieces and the page
// as a PaginatedAnnouncements struct.
func PaginateAnnouncementResponses(announcements []*AnnouncementResponse, page int) *PaginatedAnnouncementResponses {
	return &PaginatedAnnouncementResponses{
		Announcements: announcements,
		Page:          page,
	}
}

// PaginateAnnouncementResponses returns the given slice of pieces and the page as well as
// the number of pages as a PaginatedAnnouncements struct.
func PaginateNumAnnouncementResponses(announcements []*AnnouncementResponse, page, numPages int) *PaginatedAnnouncementResponses {
	return &PaginatedAnnouncementResponses{
		Announcements: announcements,
		Page:          page,
		NumPages:      numPages,
	}
}

// PaginatedUserAuditionComments defines the object that is written
// back to the client for requests that can contain multiple
// pages of UserAuditionComments
type PaginatedUserAuditionComments struct {
	Page     int                    `json:"page"`
	Comments []*UserAuditionComment `json:"comments"`
}

// PaginateAnnouncementResponses returns the given slice of pieces and the page
// as a PaginatedAnnouncements struct.
func PaginateUserAuditionComments(comments []*UserAuditionComment, page int) *PaginatedUserAuditionComments {
	return &PaginatedUserAuditionComments{
		Comments: comments,
		Page:     page,
	}
}
