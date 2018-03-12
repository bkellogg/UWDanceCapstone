package models

import (
	"database/sql"
	"errors"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// GetUserAuditionAvailability gets the availability associated with the given userID and audID
// and whether or not it should include deleted availabilities. Returns an error if one
// occurred.
func (store *Database) GetUserAuditionAvailability(userID, audID int) (*WeekTimeBlock, error) {
	// Get AvailabilityID
	result, err := store.db.Query(`SELECT AvailabilityID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.UserID = ? AND Ua.IsDeleted = FALSE`, audID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New(appvars.ErrUserAuditionDoesNotExist)
		}
		return nil, err
	}
	availID := 0
	if result.Next() {
		if err := result.Scan(&availID); err != nil {
			return nil, err
		}
	} else {
		return nil, errors.New(appvars.ErrUserAuditionDoesNotExist)
	}

	// Get Availability and Parse it
	rawAvail := &RawAvailability{}
	result, err = store.db.Query(`SELECT * FROM UserAuditionAvailability UAA WHERE UAA.ID = ?`, availID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New(appvars.ErrUserAuditionDoesNotExist)
		}
		return nil, err
	}
	if result.Next() {
		if err := result.Scan(
			&rawAvail.ID, &rawAvail.Sunday,
			&rawAvail.Monday, &rawAvail.Tuesday,
			&rawAvail.Wednesday, &rawAvail.Thursday,
			&rawAvail.Friday, &rawAvail.Saturday,
			&rawAvail.CreatedAt, &rawAvail.IsDeleted); err != nil {
			return nil, err
		}
	} else {
		return nil, errors.New(appvars.ErrUserAuditionDoesNotExist)
	}
	return rawAvail.toWeekTimeBlock()
}
