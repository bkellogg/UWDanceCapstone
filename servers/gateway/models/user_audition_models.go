package models

import "time"

// UserAuditionLinkResponse defines how a link between
// a user and an audition is reported to the client
type UserAuditionLinkResponse struct {
	User         *User                  `json:"user"`
	Audition     *Audition              `json:"audition"`
	AddedBy      int                    `json:"addedBy"`
	AddedAt      time.Time              `json:"addedAt"`
	RegNumber    int                    `json:"regNum"`
	NumShows     int                    `json:"numShows"`
	Comments     []*UserAuditionComment `json:"comments"`
	Availability *WeekTimeBlock         `json:"availability"`
}
