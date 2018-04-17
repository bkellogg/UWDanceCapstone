package models

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// GetUserAuditionLinksByAuditionID returns all user audition links of users who are in the
// the given audition and returns them. Returns an error if one occurred.
func (store *Database) GetUserAuditionLinksByAuditionID(audID int) ([]*UserAuditionLinkResponse, *DBError) {
	// TODO: TEMP IMPLEMENTATION!!! make this way better
	res, err := store.db.Query(
		`SELECT DISTINCT UA.UserID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.IsDeleted = false`, audID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error getting user ids from UserAudition: %v", err), http.StatusInternalServerError)
	}
	userIDs := make([]int64, 0)
	for res.Next() {
		var userID int64
		if err = res.Scan(&userID); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into userID"), http.StatusInternalServerError)
		}
		userIDs = append(userIDs, userID)
	}

	ualrs := make([]*UserAuditionLinkResponse, 0, len(userIDs))
	for _, uid := range userIDs {
		ualr, dberr := store.GetUserAuditionLink(int(uid), audID)
		if dberr != nil {
			return nil, dberr
		}
		ualrs = append(ualrs, ualr)
	}

	return ualrs, nil
}

// GetUserAuditionLink gets the UserAuditionLinkResponse that is affiliated with the
// given link between the given user and audition, if it exists. Returns an error
// if one occurred.
func (store *Database) GetUserAuditionLink(userID, audID int) (*UserAuditionLinkResponse, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}

	var dberr *DBError
	defer txCleanup(tx, dberr)

	ualr := &UserAuditionLinkResponse{}
	ualr.RegNumber = -1 // temp until this is implemented
	ualr.NumShows = 2   // temp until this is implemented

	user, dberr := txGetUser(tx, userID)
	if dberr != nil {
		return nil, dberr
	}
	ualr.User = user

	aud, dberr := txGetAudition(tx, audID)
	if dberr != nil {
		return nil, dberr
	}
	ualr.Audition = aud

	ua, dberr := txGetUserAudition(tx, userID, audID)
	if dberr != nil {
		return nil, dberr
	}
	ualr.AddedAt = ua.CreatedAt
	ualr.AddedBy = ua.CreatedBy

	comments, dberr := txGetUserAuditionComments(tx, ua.ID)
	if dberr != nil {
		return nil, dberr
	}
	ualr.Comments = comments

	wtb, dberr := txGetUserAuditionAvailability(tx, ua.AvailabilityID)
	if dberr != nil {
		return nil, dberr
	}
	ualr.Availability = wtb

	dberr = nil // ensure the tx is committed by the cleanup func
	return ualr, nil
}

// GetUserAuditionAvailability gets the availability associated with the given userID and audID
// and whether or not it should include deleted availabilities. Returns an error if one
// occurred.
func (store *Database) GetUserAuditionAvailability(userID, audID int) (*WeekTimeBlock, error) {
	availID, err := store.getUserAuditionID(userID, audID)
	if err != nil {
		return nil, err
	}
	// Get Availability and Parse it
	rawAvail := &RawAvailability{}
	result, err := store.db.Query(`SELECT * FROM UserAuditionAvailability UAA WHERE UAA.ID = ?`, availID)
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

// UpdateUserAuditionAvailability updates the availability for the UserAudition that is related
// the given userID and audID to the given WeekTImeBlock.
func (store *Database) UpdateUserAuditionAvailability(userID, audID int, availability *WeekTimeBlock) error {
	availID, err := store.getUserAuditionID(userID, audID)
	if err != nil {
		return err
	}
	dayMap, err := availability.ToSerializedDayMap()
	if err != nil {
		return nil
	}
	query := `
		UPDATE UserAuditionAvailability UAA SET
		UAA.Sunday = COALESCE(NULLIF(?, ''), Sunday),
		UAA.Monday = COALESCE(NULLIF(?, ''), Monday),
		UAA.Tuesday = COALESCE(NULLIF(?, ''), Tuesday),
		UAA.Wednesday = COALESCE(NULLIF(?, ''), Wednesday),
		UAA.Thursday = COALESCE(NULLIF(?, ''), Thursday),
		UAA.Friday = COALESCE(NULLIF(?, ''), Friday),
		UAA.Saturday = COALESCE(NULLIF(?, ''), Saturday)
		WHERE UAA.ID = ?`
	_, err = store.db.Exec(query,
		dayMap["sun"],
		dayMap["mon"],
		dayMap["tues"],
		dayMap["wed"],
		dayMap["thurs"],
		dayMap["fri"],
		dayMap["sat"], availID)
	return err
}

// getUserAuditionID gets the ID of the UserAudition associated with the given userID and audID.
func (store *Database) getUserAuditionID(userID, audID int) (int, error) {
	// Get AvailabilityID
	result, err := store.db.Query(`SELECT AvailabilityID FROM UserAudition UA
		WHERE UA.AuditionID = ? AND UA.UserID = ? AND UA.IsDeleted = FALSE`, audID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return -1, errors.New(appvars.ErrUserAuditionDoesNotExist)
		}
		return -1, err
	}
	availID := 0
	if result.Next() {
		if err := result.Scan(&availID); err != nil {
			return -1, err
		}
	} else {
		return -1, errors.New(appvars.ErrUserAuditionDoesNotExist)
	}
	return availID, nil
}
