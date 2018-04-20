package models

import "time"

// UserAuditionLinkResponse defines how a link between
// a user and an audition is reported to the client
type UserAuditionLinkResponse struct {
	User         *User                  `json:"user"`
	Audition     *Audition              `json:"audition,omitempty"`
	AddedAt      time.Time              `json:"addedAt"`
	AddedBy      int                    `json:"addedBy"`
	RegNum       int                    `json:"regNum"`
	NumShows     int                    `json:"numShows"`
	Comments     []*UserAuditionComment `json:"comments"`
	Availability *WeekTimeBlock         `json:"availability"`
}
