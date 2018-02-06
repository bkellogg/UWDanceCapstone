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
