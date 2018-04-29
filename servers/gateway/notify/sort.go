package notify

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/models"

type Choreographers []*models.User

// Returns true if the value at index i is less than
// the value at index j.
func (c Choreographers) Less(i, j int) bool {
	return c[i].ID < c[j].ID
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
