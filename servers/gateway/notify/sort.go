package notify

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/models"

type Choreographers []*models.User

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
