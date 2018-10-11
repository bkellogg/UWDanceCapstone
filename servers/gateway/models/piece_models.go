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
	ID                int64            `json:"pieceInfoID"`
	ChorPhone         string           `json:"choreographerPhone"`
	Title             string           `json:"title"`
	RunTime           string           `json:"runTime"`
	Composers         string           `json:"composers"`
	MusicTitle        string           `json:"musicTitle"`
	PerformedBy       string           `json:"performedBy"`
	MusicSource       string           `json:"MusicSource"`
	NumMusicians      int              `json:"numMusicians,omitempty"`
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

	if len(npis.ChorPhone) > 0 {
		if len(npis.ChorPhone) < 10 || len(npis.ChorPhone) > 11 {
			return errors.New("choreographer must have a valid phone number")
		}
	}
	if len(npis.Title) > 50 {
		return errors.New("title must be fewer than 50 characters")
	}
	if len(npis.RunTime) > 50 {
		return errors.New("run time must be fewer than 50 characters")
	}
	if len(npis.Composers) > 150 {
		return errors.New("composers must be fewer than 75 characters")
	}
	if len(npis.MusicTitle) > 150 {
		return errors.New("music title must be fewer than 150 characters")
	}
	if len(npis.PerformedBy) > 200 {
		return errors.New("performed by and be fewer than 200 characters")
	}
	if len(npis.MusicSource) > 200 {
		return errors.New("music source must be fewer than 200 characters")
	}
	if len(npis.RehearsalSchedule) > 500 {
		return errors.New("rehearsal schedule must be fewer than 500 characters")
	}
	if len(npis.ChorNotes) > 500 {
		return errors.New("choreographer notes must be fewer than 500 characters")
	}
	if len(npis.CostumeDesc) > 500 {
		return errors.New("costume description must be fewer than 500 characters")
	}
	if len(npis.ItemDesc) > 500 {
		return errors.New("item description must be fewer than 500 characters")
	}
	if len(npis.LightingDesc) > 500 {
		return errors.New("lighting description must be fewer than 500 characters")
	}
	if len(npis.OtherNotes) > 500 {
		return errors.New("other notes must be fewer than 500 characters")
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

// PieceInfoSheetUpdates defines how updates to a
// piece info sheet are made.
type PieceInfoSheetUpdates struct {
	ChorPhone         string `json:"choreographerPhone"`
	Title             string `json:"title"`
	RunTime           string `json:"runTime"`
	Composers         string `json:"composers"`
	MusicTitle        string `json:"musicTitle"`
	PerformedBy       string `json:"performedBy"`
	MusicSource       string `json:"musicSource"`
	RehearsalSchedule string `json:"rehearsalSchedule"`
	ChorNotes         string `json:"chorNotes"`
	CostumeDesc       string `json:"costumeDesc"`
	ItemDesc          string `json:"itemDesc"`
	LightingDesc      string `json:"lightingDesc"`
	OtherNotes        string `json:"otherNotes"`
}

// Validate validates the PieceInfoSheetUpdates and returns
// and error if one occurred. Also formats the various
// fields to be consistent across all submissions.
func (pisu *PieceInfoSheetUpdates) Validate() error {
	pisu.ChorPhone = trimPhone(pisu.ChorPhone)
	pisu.Title = strings.TrimSpace(pisu.Title)
	pisu.RunTime = strings.TrimSpace(pisu.RunTime)
	pisu.Composers = strings.TrimSpace(pisu.Composers)
	pisu.MusicTitle = strings.TrimSpace(pisu.MusicTitle)
	pisu.PerformedBy = strings.TrimSpace(pisu.PerformedBy)
	pisu.MusicSource = strings.TrimSpace(pisu.MusicSource)
	pisu.RehearsalSchedule = strings.TrimSpace(pisu.RehearsalSchedule)
	pisu.ChorNotes = strings.TrimSpace(pisu.ChorNotes)
	pisu.CostumeDesc = strings.TrimSpace(pisu.CostumeDesc)
	pisu.ItemDesc = strings.TrimSpace(pisu.ItemDesc)
	pisu.LightingDesc = strings.TrimSpace(pisu.LightingDesc)
	pisu.OtherNotes = strings.TrimSpace(pisu.OtherNotes)

	if len(pisu.ChorPhone) > 0 {
		if len(pisu.ChorPhone) < 10 || len(pisu.ChorPhone) > 11 {
			return errors.New("choreographer must have a valid phone number")
		}
	}
	if len(pisu.Title) > 25 {
		return errors.New("title must be fewer than 25 characters")
	}
	if len(pisu.RunTime) > 25 {
		return errors.New("run time must be fewer than 25 characters")
	}
	if len(pisu.Composers) > 75 {
		return errors.New("composers must be fewer than 75 characters")
	}
	if len(pisu.MusicTitle) > 100 {
		return errors.New("music title must be fewer than 100 characters")
	}
	if len(pisu.PerformedBy) > 100 {
		return errors.New("performed by and be fewer than 100 characters")
	}
	if len(pisu.MusicSource) > 100 {
		return errors.New("music source must be fewer than 100 characters")
	}
	if len(pisu.RehearsalSchedule) > 500 {
		return errors.New("rehearsal schedule must be fewer than 500 characters")
	}
	if len(pisu.ChorNotes) > 100 {
		return errors.New("choreographer notes must be fewer than 100 characters")
	}
	if len(pisu.CostumeDesc) > 100 {
		return errors.New("costume description must be fewer than 100 characters")
	}
	if len(pisu.ItemDesc) > 100 {
		return errors.New("item description must be fewer than 100 characters")
	}
	if len(pisu.LightingDesc) > 100 {
		return errors.New("lighting description must be fewer than 100 characters")
	}
	if len(pisu.OtherNotes) > 100 {
		return errors.New("other notes must be fewer than 100 characters")
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
	}
	if len(npm.Email) > 0 {
		if _, err := mail.ParseAddress(npm.Email); err != nil {
			return errors.New("piece musicians must have a valid email address")
		}
	}
	npm.Name = strings.Title(npm.Name)
	npm.Email = strings.ToLower(npm.Email)
	return nil
}

// MusicianUpdates defines how updates for a musician
// are sent to the server.
type MusicianUpdates struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
	Email string `json:"email"`
}

// Validate validates the current musician updates.
// Returns an error if one occurred.
func (mu *MusicianUpdates) Validate() error {
	if len(mu.Name) > 50 {
		return errors.New("piece musician name is too long")
	}
	if len(mu.Email) > 75 {
		return errors.New("piece musician email is too long")
	}
	if len(mu.Phone) > 0 {
		if len(mu.Phone) < 10 || len(mu.Phone) > 11 {
			return errors.New("piece musician must have a valid phone number")
		}
	}
	if len(mu.Email) > 0 {
		if _, err := mail.ParseAddress(mu.Email); err != nil {
			return errors.New("piece musicians must have a valid email address")
		}
	}
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
