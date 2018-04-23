package models

import (
	"fmt"
	"net/http"
)

// ModifyShowAuditionRelationship assigns the given audition to the given show
// if they both exist. Returns an error if one occurred.
func (store *Database) ModifyShowAuditionRelationship(showID, audID int, assigning bool) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	var dberr *DBError
	defer txCleanup(tx, dberr)

	_, dberr = txGetShow(tx, showID)
	if dberr != nil {
		return dberr
	}

	_, dberr = txGetAudition(tx, audID)
	if dberr != nil {
		return dberr
	}

	// only look up if the given audition id is assigned to a show
	// if we're attempting to assign it again.
	if assigning {
		_, dberr = txGetShowByAuditionID(tx, audID)
		if dberr == nil {
			return NewDBError(fmt.Sprintf("audition id '%d' is already assigned to a show", audID), http.StatusBadRequest)
		}
		if dberr != nil && dberr.HTTPStatus != http.StatusNotFound {
			return dberr
		}
	} else {
		// if we're removing the relationship between the show
		// and the audition, set the show's auditionID to be 0.
		audID = 0
	}

	_, err = tx.Exec(`UPDATE Shows SET AuditionID = ? WHERE ShowID = ?`, audID, showID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error assigning auditon to show: %v", err), http.StatusInternalServerError)
	}
	dberr = nil
	return nil
}
