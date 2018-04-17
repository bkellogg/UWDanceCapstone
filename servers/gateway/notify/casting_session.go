package notify

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/models"

// CastingSession is a controller for a specific
// session of casting.
type CastingSession struct {
	hasBegun  bool                      // whether or not the session has begun or not
	dancers   map[DancerID]*Dancer      // all dancers in the audition
	uncasted  map[DancerID]*Dancer      // all dancers that have no been cast
	contested map[int64][]Choreographer // who is contested; map of contested dancer to all choreographers contesting
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
	choreographers []int64
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
type Dancer models.UserAuditionLink
