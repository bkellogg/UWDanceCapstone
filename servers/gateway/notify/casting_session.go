package notify

import (
	"net/http"
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// CastingSession is a controller for a specific
// session of casting.
type CastingSession struct {
	HasBegun  bool                           // whether or not the session has begun or not
	Store     *models.Database               // Database that stores all information in the app
	dancers   map[DancerID]Dancer            // all dancers in the audition
	uncasted  map[DancerID]Dancer            // all dancers that have no been cast
	contested map[DancerID][]ContestedDancer // who is contested; map of contested dancer to all choreographers contesting
	mx        sync.RWMutex                   // mutex to hold locks while modifying the session
}

// NewCastingSession returns a casting session hooked up
// to the given database.
func NewCastingSession(db *models.Database) *CastingSession {
	return &CastingSession{
		HasBegun:  false,
		Store:     db,
		dancers:   make(map[DancerID]Dancer),
		uncasted:  make(map[DancerID]Dancer),
		contested: make(map[DancerID][]ContestedDancer),
	}
}

// LoadFromAudition loads the the given casting session from
// the users in the given audition ID. Reports an error if
// called on a casting session that has already begun.
func (c *CastingSession) LoadFromAudition(id int) *middleware.HTTPError {
	if c.HasBegun {
		return middleware.NewHTTPError("cannot load from audition into a casting session that has already begun",
			http.StatusInternalServerError)
	}
	c.mx.Lock()
	defer c.mx.Unlock()

	ualrs, dberr := c.Store.GetUserAuditionLinksByAuditionID(id)
	if dberr != nil {
		return middleware.HTTPErrorFromDBError(dberr)
	}

	for _, ualr := range ualrs {
		dancer := Dancer(ualr)
		c.dancers[DancerID(ualr.User.ID)] = dancer
	}

	c.HasBegun = true
	return nil
}

// Flush clears the current casting session and makes it ready to be used again.
// Dumps all suers and states currently stored in the casting session.
// Waits until all routines interacting with the session finish before flushing.
func (c *CastingSession) Flush() {
	c.mx.Lock()
	c.HasBegun = false
	c.dancers = make(map[DancerID]Dancer)
	c.uncasted = make(map[DancerID]Dancer)
	c.contested = make(map[DancerID][]ContestedDancer)
	c.mx.Unlock()
}

// ChoreographerUpdate defines how a single choreographer's
// update will be sent to the server.
type ChoreographerUpdate struct {
	Rank1 []int64 `json:"rank1"`
	Rank2 []int64 `json:"rank2"`
	Rank3 []int64 `json:"rank3"`
}

// ContestedDancer represents a dancer that is contested
// and which choreographers are wanted that dancer
type ContestedDancer struct {
	dancer         Dancer
	choreographers []Choreographer
}

// CastingUpdate defines how an update to the casting session
// will be sent to all casting websocket clients.
type CastingUpdate struct {
	Cast      []*Dancer          `json:"cast"`
	Contested []*ContestedDancer `json:"contested"`
	Uncasted  []*Dancer          `json:"uncasted"`
}

// Choreographer is a choreographer who is currently
// casting.
type Choreographer int64

// DancerID is an ID of a dancer who is in the casting
// process, whether selected or not.
type DancerID int64

// Dancer stores all of the information about a specific
// dancer in relation to a specific audition.
type Dancer *models.UserAuditionLinkResponse
