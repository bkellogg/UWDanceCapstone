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
	HasBegun       bool                                `json:"hasBegun"`       // whether or not the session has begun or not
	Store          *models.Database                    `json:"-"`              // Database that stores all information in the app
	Dancers        map[DancerID]*Dancer                `json:"dancers"`        // all Dancers in the audition
	Choreographers map[Choreographer]map[DancerID]Rank `json:"choreographers"` // all Choreographers in the casting session to all Dancers they have
	Uncasted       map[DancerID]bool                   `json:"uncasted"`       // all Dancers that have no been cast
	Casted         map[DancerID]map[Choreographer]bool `json:"casted"`         // all dancers that have been casted and who they're casted by
	mx             sync.RWMutex                        `json:"-"`              // mutex to hold locks while modifying the session
}

// NewCastingSession returns a casting session hooked up
// to the given database.
func NewCastingSession(db *models.Database) *CastingSession {
	return &CastingSession{
		HasBegun:       false,
		Store:          db,
		Dancers:        make(map[DancerID]*Dancer),
		Choreographers: make(map[Choreographer]map[DancerID]Rank),
		Uncasted:       make(map[DancerID]bool),
		Casted:         make(map[DancerID]map[Choreographer]bool),
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
		c.Uncasted[DancerID(ualr.User.ID)] = true
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
	c.Choreographers = make(map[Choreographer]map[DancerID]Rank)
	c.Dancers = make(map[DancerID]*Dancer)
	c.Uncasted = make(map[DancerID]bool)
	c.Casted = make(map[DancerID]map[Choreographer]bool)
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
	dancerSlice := make(map[DancerID]Rank)
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
		return errors.New("choreographer does not exist. did you forget to begin casting? ")
	}

	return c.handle(chorID, cu)
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

// dancer returns the Dancer in the current casting session
// that has the given id. Unsafe for concurrent access.
func (c *CastingSession) dancer(id int64) (*Dancer, bool) {
	dancer, found := c.Dancers[DancerID(id)]
	return dancer, found
}

// dropAll removes every entry in the choreographer update from the given
// choreographer.
func (c *CastingSession) dropAll(chorID int64, cu *ChoreographerUpdate) error {
	for _, id := range cu.Drops {
		// drop the dancer from the choreographer's list
		delete(c.Choreographers[Choreographer(chorID)], DancerID(id))

		// drop the choreographer from the dancer's list
		delete(c.Casted[DancerID(id)], Choreographer(chorID))
		if len(c.Casted[DancerID(id)]) == 0 {
			delete(c.Casted, DancerID(id))
		}

		_, isCasted := c.dancerIsCasted(id)
		if !isCasted {
			c.Uncasted[DancerID(id)] = true
		}
	}
	return nil
}

// dancerIsCasted returns the choreographer who casted them and a bool
// representing if they are casted or not.
func (c *CastingSession) dancerIsCasted(id int64) (Choreographer, bool) {
	for chorID, chorDancers := range c.Choreographers {
		for dancerID, _ := range chorDancers {
			if dancerID == DancerID(id) {
				return Choreographer(chorID), true
			}
		}
	}
	return -1, false
}

// dancerIsContested returns a slice of choreographers that are contesting
// the given dancer and bool representing if the dancer is contested
func (c *CastingSession) dancerIsContested(dancerID DancerID) ([]Choreographer, bool) {
	chors := c.Casted[dancerID]
	if len(chors) <= 1 {
		return nil, false
	}
	chorSlice := make([]Choreographer, 0, len(chors))
	for chor, _ := range chors {
		chorSlice = append(chorSlice, chor)
	}
	return chorSlice, true
}

// rankAll ranks all the given dancer ids with the given rank
// and adds them to the given Choreographers Dancers
func (c *CastingSession) rankAll(chorID int64, cu *ChoreographerUpdate) error {
	for i, rank := range [][]int64{cu.Rank1, cu.Rank2, cu.Rank3} {
		for _, id := range rank {
			delete(c.Uncasted, DancerID(id)) // remove the dancer from the Uncasted list
			_, found := c.dancer(id)
			if !found {
				return fmt.Errorf("invalid update: dancer id '%d' is not in this audition", id)
			}

			if c.Casted[DancerID(id)] == nil {
				c.Casted[DancerID(id)] = make(map[Choreographer]bool)
			}
			// update the casted list
			c.Casted[DancerID(id)][Choreographer(chorID)] = true

			// update the choreographer list
			c.Choreographers[Choreographer(chorID)][DancerID(id)] = Rank(i + 1)
		}
	}
	return nil
}

// makeContestedDancer returns a ContestedDancer from the given
// dancer and choreographers
func (c *CastingSession) makeContestedDancer(id DancerID, chors []Choreographer) *ContestedDancer {
	cd := &ContestedDancer{}
	dancer, _ := c.dancer(id.int())
	cd.Dancer = dancer
	cd.Choreographers = chors
	return cd
}

// ToCastingUpdate returns the casting session as a CastingUpdate
// for the specified choreographer
func (c *CastingSession) ToCastingUpdate(chorID int64) (*CastingUpdate, error) {
	if !c.HasBegun {
		return nil, errors.New("casting session has not begun")
	}
	if !c.choreographerExists(chorID) {
		return nil, fmt.Errorf(
			"'%d' is not a choreographer in this casting session",
			chorID)
	}
	castingUpdate := &CastingUpdate{}

	// build list of uncasted dancers
	uncasted := make([]*Dancer, 0, len(c.Uncasted))
	for dID, _ := range c.Uncasted {
		dancer, _ := c.dancer(int64(dID))
		uncasted = append(uncasted, dancer)
	}
	castingUpdate.Uncasted = uncasted

	// build list of un/contested dancers
	castingUpdate.Contested = make([]*ContestedDancer, 0)
	castingUpdate.Cast = make([]*Dancer, 0)
	chorDancers := c.Choreographers[Choreographer(chorID)]
	for dancerID, _ := range chorDancers {
		chorsContesting, isContested := c.dancerIsContested(dancerID)
		if isContested {
			castingUpdate.Contested = append(castingUpdate.Contested, c.makeContestedDancer(dancerID, chorsContesting))
		} else {
			dancer, _ := c.dancer(dancerID.int())
			castingUpdate.Cast = append(castingUpdate.Cast, dancer)
		}
	}

	return castingUpdate, nil
}

// ChoreographerUpdate defines how a single choreographer's
// update will be sent to the server.
type ChoreographerUpdate struct {
	Action string  `json:"action"`
	Drops  []int64 `json:"drops,omitempty"`
	Rank1  []int64 `json:"rank1,omitempty"`
	Rank2  []int64 `json:"rank2,omitempty"`
	Rank3  []int64 `json:"rank3,omitempty"`
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
	Dancer         *Dancer         `json:"dancer"`
	Choreographers []Choreographer `json:"choreographers"`
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
	Dancer *Dancer `json:"dancer"`
	Rank   int64   `json:"rank"`
}

// Rank represents a rank of a dancer
type Rank int

// int returns the rank as an int64
func (r Rank) int() int64 {
	return int64(r)
}

// Choreographer is a choreographer who is currently
// casting.
type Choreographer int64

// DancerID is an ID of a dancer who is in the casting
// process, whether selected or not.
type DancerID int64

// int returns the dancerID as an int64
func (d DancerID) int() int64 {
	return int64(d)
}

// Dancer stores all of the information about a specific
// dancer in relation to a specific audition.
type Dancer models.UserAuditionLinkResponse

// Rank ranks the given dancer and returns the resulting
// RankedDancer or an error if one occurred.
func (d *Dancer) Rank(rank int) *RankedDancer {
	return &RankedDancer{Dancer: d, Rank: int64(rank)}
}
