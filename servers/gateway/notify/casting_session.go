package notify

import (
	"errors"
	"fmt"
	"net/http"
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/middleware"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
)

const (
	actionRemove = "remove"
	actionAdd    = "add"
)

// CastingSession is a controller for a specific
// session of casting.
type CastingSession struct {
	HasBegun       bool                                         `json:"hasBegun"`       // whether or not the session has begun or not
	Store          *models.Database                             `json:"-"`              // Database that stores all information in the app
	Dancers        map[DancerID]*Dancer                         `json:"dancers"`        // all Dancers in the audition
	Choreographers map[Choreographer]map[DancerID]*RankedDancer `json:"choreographers"` // all Choreographers in the casting session to all Dancers they have
	Uncasted       map[DancerID]*Dancer                         `json:"uncasted"`       // all Dancers that have no been cast
	Contested      map[DancerID][]ContestedDancer               `json:"contested"`      // who is Contested; map of Contested dancer to all Choreographers contesting; pending delete
	mx             sync.RWMutex                                 `json:"-"`              // mutex to hold locks while modifying the session
}

// NewCastingSession returns a casting session hooked up
// to the given database.
func NewCastingSession(db *models.Database) *CastingSession {
	return &CastingSession{
		HasBegun:       false,
		Store:          db,
		Dancers:        make(map[DancerID]*Dancer),
		Choreographers: make(map[Choreographer]map[DancerID]*RankedDancer),
		Uncasted:       make(map[DancerID]*Dancer),
		Contested:      make(map[DancerID][]ContestedDancer),
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
		c.Dancers[DancerID(ualr.User.ID)] = &dancer
		c.Uncasted[DancerID(ualr.User.ID)] = &dancer
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
	c.Choreographers = make(map[Choreographer]map[DancerID]*RankedDancer)
	c.Dancers = make(map[DancerID]*Dancer)
	c.Uncasted = make(map[DancerID]*Dancer)
	c.Contested = make(map[DancerID][]ContestedDancer)
	c.mx.Unlock()
}

// AddChoreographer adds the given choreographer id
// to the casting session.
func (c *CastingSession) AddChoreographer(id int64) error {
	c.mx.Lock()
	defer c.mx.Unlock()
	if !c.HasBegun {
		return errors.New("casting session has not begun")
	}
	if _, found := c.Choreographers[Choreographer(id)]; found {
		return errors.New("choreographer is already in this casting session")
	}
	dancerSlice := make(map[DancerID]*RankedDancer)
	c.Choreographers[Choreographer(id)] = dancerSlice
	return nil
}

// choreographerExists returns true if the given choreographer
// is in the casting session, false if otherwise. Unsafe for
// concurrent access.
func (c *CastingSession) choreographerExists(id int64) bool {
	_, found := c.Choreographers[Choreographer(id)]
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

	return c.handle(chorID, cu)
}

// dancer returns the Dancer in the current casting session
// that has the given id. Unsafe for concurrent access.
func (c *CastingSession) dancer(id int64) (*Dancer, bool) {
	dancer, found := c.Dancers[DancerID(id)]
	return dancer, found
}

// handle handles the given choreographer update.
// Returns an error if one occurred.
func (c *CastingSession) handle(chorID int64, cu *ChoreographerUpdate) error {
	switch cu.Action {
	case actionRemove:
		return c.dropAll(chorID, cu)
	case actionAdd:
		return c.rankAll(chorID, cu)
	default:
		return errors.New("invalid update action")
	}
}

// dropAll removes every entry in the choreographer update from the given
// choreographer.
func (c *CastingSession) dropAll(chorID int64, cu *ChoreographerUpdate) error {
	for _, rank := range [][]int64{cu.Rank1, cu.Rank2, cu.Rank3} {
		for _, id := range rank {
			delete(c.Choreographers[Choreographer(chorID)], DancerID(id))
			_, isCasted := c.dancerIsCasted(id)
			if !isCasted {
				dancer, isDancer := c.dancer(id)
				if !isDancer {
					return fmt.Errorf("%d is not a dancer in this audition", id)
				}
				c.Uncasted[DancerID(id)] = dancer
			}
		}
	}
	return nil
}

// dancerIsCasted returns the choreographer who casted them and a bool
// representing if they are casted or not.
func (c *CastingSession) dancerIsCasted(id int64) (Choreographer, bool) {
	return -1, false
}

// rankAll ranks all the given dancer ids with the given rank
// and adds them to the given Choreographers Dancers
func (c *CastingSession) rankAll(chorID int64, cu *ChoreographerUpdate) error {
	dancerMap := make(map[DancerID]*RankedDancer)
	for i, rank := range [][]int64{cu.Rank1, cu.Rank2, cu.Rank3} {
		for _, id := range rank {
			delete(c.Uncasted, DancerID(id)) // remove the dancer from the Uncasted list
			dancer, found := c.dancer(id)
			if !found {
				return fmt.Errorf("invalid update: dancer id '%d' is not in this audition", id)
			}
			dancerMap[DancerID(id)] = dancer.Rank(i + 1)
		}
	}
	c.Choreographers[Choreographer(chorID)] = dancerMap
	return nil
}

// ToCastingUpdate returns the casting session as a CastingUpdate
// for the specified choreographer
func (c *CastingSession) ToCastingUpdate(id int64) (*CastingUpdate, error) {
	if !c.HasBegun {
		return nil, errors.New("casting session has not begun")
	}
	if !c.choreographerExists(id) {
		return nil, fmt.Errorf(
			"'%d' is not a choreographer in this casting session",
			id)
	}
	castingUpdate := &CastingUpdate{}

	// build list of uncasted dancers
	uncasted := make([]*Dancer, 0, len(c.Uncasted))
	for _, dancer := range c.Uncasted {
		uncasted = append(uncasted, dancer)
	}
	castingUpdate.Uncasted = uncasted

	// build list of contested dancers
	// TODO: Implement this
	castingUpdate.Contested = make([]*ContestedDancer, 0)

	// build list of dancers the choreographer has confirmed
	cast := make(map[int64][]*Dancer)
	for _, rd := range c.Choreographers[Choreographer(id)] {
		cast[rd.Rank] = append(cast[rd.Rank], rd.Dancer)
	}

	castingUpdate.Cast = cast
	return castingUpdate, nil
}

// ChoreographerUpdate defines how a single choreographer's
// update will be sent to the server.
type ChoreographerUpdate struct {
	Action string  `json:"action"`
	Rank1  []int64 `json:"rank1"`
	Rank2  []int64 `json:"rank2"`
	Rank3  []int64 `json:"rank3"`
}

// Validate validates the given choreographer updates.
// Returns an error if one occurred.
func (cu *ChoreographerUpdate) Validate() error {
	switch cu.Action {
	case actionAdd, actionRemove:
	default:
		return errors.New("invalid update action; action must be 'add' or 'remove'")
	}
	tempMap := make(map[int64]bool)
	for _, rank := range [][]int64{cu.Rank1, cu.Rank2, cu.Rank3} {
		for _, id := range rank {
			exists := tempMap[id]
			if exists {
				return fmt.Errorf("dancer id '%d' can only be in one rank once", id)
			}
			tempMap[id] = true
		}
	}
	return nil
}

// ContestedDancer represents a dancer that is Contested
// and which Choreographers are wanted that dancer
type ContestedDancer struct {
	dancer         Dancer
	choreographers []Choreographer
}

// CastingUpdate defines how an update to the casting session
// will be sent to all casting websocket clients.
type CastingUpdate struct {
	Cast      map[int64][]*Dancer `json:"cast"`
	Contested []*ContestedDancer  `json:"Contested"`
	Uncasted  []*Dancer           `json:"Uncasted"`
}

// RankedDancer defines a dancer that has a rank.
type RankedDancer struct {
	Dancer *Dancer `json:"dancer"`
	Rank   int64   `json:"rank"`
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
func (d *Dancer) Rank(rank int) *RankedDancer {
	return &RankedDancer{Dancer: d, Rank: int64(rank)}
}
