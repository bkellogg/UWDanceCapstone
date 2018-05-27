package models

import (
	"errors"
	"fmt"
	"net/mail"
	"strings"
	"time"
)

// NewPiece defines the information needed to create a new piece.
type NewPiece struct {
	Name            string `json:"name"`
	ChoreographerID int    `json:"choreographerID"`
	ShowID          int    `json:"showID,omitempty"`
	CreatedBy       int    `json:"-"` // this will never be supplied by user, but will be populated by the handler
}

// Validate validates the new piece and returns an error if one occurred.
func (np *NewPiece) Validate() error {
	if len(np.Name) == 0 {
		return errors.New("new piece must have a name")
	}
	return nil
}

// Piece defines a piece within a show.
type Piece struct {
	ID              int       `json:"id"`
	InfoSheetID     int       `json:"infoSheetID"`
	ChoreographerID int       `json:"choreographerID,omitempty"`
	Name            string    `json:"name"`
	ShowID          int       `json:"showID,omitempty"`
	CreatedAt       time.Time `json:"createdAt"`
	CreatedBy       int       `json:"createdBy"`
	IsDeleted       bool      `json:"isDeleted"`
}

// PieceUsersResponse represents how the server will
// report all users in a piece.
type PieceUsersResponse struct {
	Page          int             `json:"page"`
	NumPages      int             `json:"numPages,omitempty"`
	Choreographer *UserResponse   `json:"choreographer"`
	Dancers       []*UserResponse `json:"dancers"`
}

// NewPieceUsersResponse returns a new pointer to a PieceUsersResponse from the
// given information.
func NewPieceUsersResponse(page, numPages int, chor *UserResponse, dancers []*UserResponse) *PieceUsersResponse {
	return &PieceUsersResponse{Page: page, Choreographer: chor, Dancers: dancers, NumPages: numPages}
}

// PieceInfoSheet defines how a piece info sheet is
// stored.
type PieceInfoSheet struct {
	PieceInfoID       int64            `json:"pieceInfoID"`
	ChorPhone         string           `json:"choreographerPhone"`
	Title             string           `json:"title"`
	RunTime           string           `json:"runTime"`
	Composers         string           `json:"composers"`
	MusicTitle        string           `json:"musicTitle"`
	PerformedBy       string           `json:"performedBy"`
	MusicSource       string           `json:"MusicSource"`
	NumMusicians      int              `json:"numMusicians"`
	RehearsalSchedule string           `json:"rehearsalSchedule"`
	ChorNotes         string           `json:"chorNotes"`
	Musicians         []*PieceMusician `json:"musicians"`
	CostumeDesc       string           `json:"costumeDesc"`
	ItemDesc          string           `json:"itemDesc"`
	LightingDesc      string           `json:"lightingDesc"`
	OtherNotes        string           `json:"otherNotes"`
	CreatedAt         time.Time        `json:"createdAt"`
	CreatedBy         int              `json:"createdBy"`
	IsDeleted         bool             `json:"isDeleted"`
}

// NewPieceInfoSheet defines how a new piece info sheet
// is sent to the server.
type NewPieceInfoSheet struct {
	ChorPhone         string              `json:"choreographerPhone"`
	Title             string              `json:"title"`
	RunTime           string              `json:"runTime"`
	Composers         string              `json:"composers"`
	MusicTitle        string              `json:"musicTitle"`
	PerformedBy       string              `json:"performedBy"`
	MusicSource       string              `json:"musicSource"`
	NumMusicians      int                 `json:"numMusicians"`
	RehearsalSchedule string              `json:"rehearsalSchedule"`
	ChorNotes         string              `json:"chorNotes"`
	Musicians         []*NewPieceMusician `json:"musicians"`
	CostumeDesc       string              `json:"costumeDesc"`
	ItemDesc          string              `json:"itemDesc"`
	LightingDesc      string              `json:"lightingDesc"`
	OtherNotes        string              `json:"otherNotes"`
}

// Validate validates the NewPieceInfoSheets and returns
// and error if one occurred. Also formats the various
// fields to be consistent across all submissions.
func (npis *NewPieceInfoSheet) Validate() error {
	npis.ChorPhone = trimPhone(npis.ChorPhone)
	npis.Title = strings.TrimSpace(npis.Title)
	npis.RunTime = strings.TrimSpace(npis.RunTime)
	npis.Composers = strings.TrimSpace(npis.Composers)
	npis.MusicTitle = strings.TrimSpace(npis.MusicTitle)
	npis.PerformedBy = strings.TrimSpace(npis.PerformedBy)
	npis.MusicSource = strings.TrimSpace(npis.MusicSource)
	npis.RehearsalSchedule = strings.TrimSpace(npis.RehearsalSchedule)
	npis.ChorNotes = strings.TrimSpace(npis.ChorNotes)
	npis.CostumeDesc = strings.TrimSpace(npis.CostumeDesc)
	npis.ItemDesc = strings.TrimSpace(npis.ItemDesc)
	npis.LightingDesc = strings.TrimSpace(npis.LightingDesc)
	npis.OtherNotes = strings.TrimSpace(npis.OtherNotes)

	if len(npis.ChorPhone) < 10 || len(npis.ChorPhone) > 11 {
		return errors.New("choreographer must have a valid phone number")
	}
	if len(npis.Title) == 0 || len(npis.Title) > 25 {
		return errors.New("title must exist and be fewer than 25 characters")
	}
	if len(npis.RunTime) == 0 || len(npis.RunTime) > 25 {
		return errors.New("run time must exist and be fewer than 25 characters")
	}
	if len(npis.Composers) == 0 || len(npis.Composers) > 75 {
		return errors.New("composers must exist and be fewer than 75 characters")
	}
	if len(npis.MusicTitle) == 0 || len(npis.MusicTitle) > 100 {
		return errors.New("music title must exist and be fewer than 100 characters")
	}
	if len(npis.PerformedBy) == 0 || len(npis.PerformedBy) > 100 {
		return errors.New("performed by must exist and be fewer than 100 characters")
	}
	if len(npis.MusicSource) == 0 || len(npis.MusicSource) > 100 {
		return errors.New("music source must exist and be fewer than 100 characters")
	}
	if len(npis.RehearsalSchedule) == 0 || len(npis.RehearsalSchedule) > 100 {
		return errors.New("rehearsal schedule must exist and be fewer than 100 characters")
	}
	if len(npis.ChorNotes) == 0 || len(npis.ChorNotes) > 100 {
		return errors.New("choreographer notes must exist and be fewer than 100 characters")
	}
	if len(npis.CostumeDesc) == 0 || len(npis.CostumeDesc) > 100 {
		return errors.New("costume description must exist and be fewer than 100 characters")
	}
	if len(npis.ItemDesc) == 0 || len(npis.ItemDesc) > 100 {
		return errors.New("item description must exist and be fewer than 100 characters")
	}
	if len(npis.LightingDesc) == 0 || len(npis.LightingDesc) > 100 {
		return errors.New("lighting description must exist and be fewer than 100 characters")
	}
	if len(npis.OtherNotes) == 0 || len(npis.OtherNotes) > 100 {
		return errors.New("other notes must exist and be fewer than 100 characters")
	}
	if npis.NumMusicians != len(npis.Musicians) {
		return errors.New("declared number of musicians does not match actual number of musicians")
	}
	if npis.Musicians == nil {
		npis.Musicians = make([]*NewPieceMusician, 0)
	}
	for _, mus := range npis.Musicians {
		if err := mus.Validate(); err != nil {
			return fmt.Errorf("invalid musician given: %v", err)
		}
	}
	return nil
}

// PieceMusician defines how a musician for a
// piece is stored.
type PieceMusician struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"createdAt"`
	CreatedBy int       `json:"createdBy"`
	IsDeleted bool      `json:"isDeleted"`
}

// NewPieceMusician defines how a piece musician
// is send to the server.
type NewPieceMusician struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

// Validate validates the NewPieceMusician and returns
// and error if one occurred. Also formats the various
// fields to be consistent across all submissions.
func (npm *NewPieceMusician) Validate() error {
	npm.Phone = trimPhone(npm.Phone)
	npm.Name = strings.TrimSpace(npm.Name)
	npm.Email = strings.TrimSpace(npm.Email)
	if len(npm.Name) == 0 {
		return errors.New("piece musician must have a name")
	}
	if len(npm.Name) > 50 {
		return errors.New("piece musician name is too long")
	}
	if len(npm.Email) > 75 {
		return errors.New("piece musician email is too long")
	}
	if len(npm.Phone) > 0 {
		if len(npm.Phone) < 10 || len(npm.Phone) > 11 {
			return errors.New("piece musician must have a valid phone number")
		}
	} else {
		npm.Phone = "Not provided"
	}
	if len(npm.Email) > 0 {
		if _, err := mail.ParseAddress(npm.Email); err != nil {
			return errors.New("piece musicians must have a valid email address")
		}
	} else {
		npm.Email = "Not provided"
	}
	npm.Name = strings.Title(npm.Name)
	npm.Email = strings.ToLower(npm.Email)
	return nil
}

// timePhone removes any spaces, -, and () from the
// phone number.
func trimPhone(phone string) string {
	phone = strings.Replace(phone, "-", "", -1)
	phone = strings.Replace(phone, "(", "", -1)
	phone = strings.Replace(phone, ")", "", -1)
	phone = strings.Replace(phone, " ", "", -1)
	return phone
}
