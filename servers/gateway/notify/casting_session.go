package notify

import (
	"errors"
	"fmt"
	"net/http"
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

// CastingSession is a controller for a specific
// session of casting.
type CastingSession struct {
	HasBegun       bool                              // whether or not the session has begun or not
	Store          *models.Database                  // Database that stores all information in the app
	dancers        map[DancerID]*Dancer              // all dancers in the audition
	choreographers map[Choreographer][]*RankedDancer // all choreographers in the casting session to all dancers they have
	uncasted       map[DancerID]*Dancer              // all dancers that have no been cast
	contested      map[DancerID][]ContestedDancer    // who is contested; map of contested dancer to all choreographers contesting; pending delete
	mx             sync.RWMutex                      // mutex to hold locks while modifying the session
}

// NewCastingSession returns a casting session hooked up
// to the given database.
func NewCastingSession(db *models.Database) *CastingSession {
	return &CastingSession{
		HasBegun:       false,
		Store:          db,
		dancers:        make(map[DancerID]*Dancer),
		choreographers: make(map[Choreographer][]*RankedDancer),
		uncasted:       make(map[DancerID]*Dancer),
		contested:      make(map[DancerID][]ContestedDancer),
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
		dancer := Dancer(*ualr)
		c.dancers[DancerID(ualr.User.ID)] = &dancer
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
	c.choreographers = make(map[Choreographer][]*RankedDancer)
	c.dancers = make(map[DancerID]*Dancer)
	c.uncasted = make(map[DancerID]*Dancer)
	c.contested = make(map[DancerID][]ContestedDancer)
	c.mx.Unlock()
}

// AddChoreographer adds the given choreographer id
// to the casting session.
func (c *CastingSession) AddChoreographer(id int64) error {
	c.mx.Lock()
	defer c.mx.Unlock()
	if !c.HasBegun {
		return errors.New("cannot add a choreographer to a casting session that hasn't started")
	}
	if _, found := c.choreographers[Choreographer(id)]; found {
		return errors.New("choreographer is already in this casting session")
	}
	dancerSlice := make([]*RankedDancer, 0)
	c.choreographers[Choreographer(id)] = dancerSlice
	return nil
}

// choreographerExists returns true if the given choreographer
// is in the casting session, false if otherwise. Unsafe for
// concurrent access.
func (c *CastingSession) choreographerExists(id int64) bool {
	_, found := c.choreographers[Choreographer(id)]
	return found
}

// Handle handles the given choreographer update.
// Returns an error if one occurred.
func (c *CastingSession) Handle(chorID int64, cu *ChoreographerUpdate) error {
	c.mx.Lock()
	defer c.mx.Unlock()

	if !c.choreographerExists(chorID) {
		return errors.New("choreographer does not exist")
	}

	if err := c.rankAll(chorID, cu.Rank1, 1); err != nil {
		return fmt.Errorf("error applying rank 1 dancers: %v", err)
	}
	if err := c.rankAll(chorID, cu.Rank2, 2); err != nil {
		return fmt.Errorf("error applying rank 2 dancers: %v", err)
	}
	if err := c.rankAll(chorID, cu.Rank3, 3); err != nil {
		return fmt.Errorf("error applying rank 1 dancers: %v", err)
	}
	return nil
}

// dancer returns the Dancer in the current casting session
// that has the given id. Unsafe for concurrent access.
func (c *CastingSession) dancer(id int64) (*Dancer, bool) {
	dancer, found := c.dancers[DancerID(id)]
	return dancer, found
}

// rankAll ranks all the given dancer ids with the given rank
// and adds them to the given choreographers dancers
func (c *CastingSession) rankAll(chorID int64, dancers []int64, rank int64) error {
	if rank < 1 || rank > 3 {
		return errors.New("dancer rank must be between 1 and 3")
	}
	dancerList, _ := c.choreographers[Choreographer(chorID)]
	for _, id := range dancers {
		delete(c.dancers, DancerID(id)) // remove the dancer from the uncasted list
		dancer, found := c.dancer(id)
		if !found {
			return fmt.Errorf("invalid update: dancer id '%d' does not exist", id)
		}
		dancerList = append(dancerList, dancer.Rank(1))
	}
	return nil
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

// RankedDancer defines a dancer that has a rank.
type RankedDancer struct {
	Dancer *Dancer
	Rank   int64
}

// Choreographer is a choreographer who is currently
// casting.
type Choreographer int64

// DancerID is an ID of a dancer who is in the casting
// process, whether selected or not.
type DancerID int64

// Dancer stores all of the information about a specific
// dancer in relation to a specific audition.
type Dancer models.UserAuditionLinkResponse

// Rank ranks the given dancer and returns the resulting
// RankedDancer or an error if one occurred.
func (d *Dancer) Rank(rank int64) *RankedDancer {
	return &RankedDancer{Dancer: d, Rank: rank}
}
