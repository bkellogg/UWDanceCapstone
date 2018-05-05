package notify

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/models"

type Choreographers []*models.User

// Returns true if the value at index i is less than
// the value at index j.
func (c Choreographers) Less(i, j int) bool {
	return c[i].ID < c[j].ID
}

// ByIDChorFirst returns a comparator func that would cause the choreographers
// to be sorted by ID, but will force the given chorID to appear first
// regardless of ID.
func (c Choreographers) ByIDChorFirst(chorID int64) func(int, int) bool {
	return func(i, j int) bool {
		if c[i].ID == chorID {
			return true
		}
		if c[j].ID == chorID {
			return false
		}
		return c[i].ID < c[j].ID
	}
}

type RDSlice []*RankedDancer

// Returns true if the value at index i is less than
// the value at index j.
func (rds RDSlice) Less(i, j int) bool {
	return rds[i].Dancer.RegNum < rds[j].Dancer.RegNum
}

type CDSlice []*ContestedDancer

// Returns true if the value at index i is less than
// the value at index j.
func (cds CDSlice) Less(i, j int) bool {
	return cds[i].Dancer.Dancer.RegNum < cds[j].Dancer.Dancer.RegNum
}

type DSlice []*Dancer

// Returns true if the value at index i is less than
// the value at index j.
func (d DSlice) Less(i, j int) bool {
	return d[i].RegNum < d[j].RegNum
}
