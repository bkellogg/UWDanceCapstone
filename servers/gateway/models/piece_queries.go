package models

import (
	"database/sql"
	"fmt"
	"net/http"
	"time"
)

// InsertNewPiece inserts the given NewPiece into the database and returns the
// created Piece, or an error if one occurred.
func (store *Database) InsertNewPiece(newPiece *NewPiece) (*Piece, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query(`SELECT * FROM Shows S WHERE S.ShowID = ?`, newPiece.ShowID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError(fmt.Sprintf("no show found with id %v", newPiece.ShowID), http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving show from database: %v", err), http.StatusInternalServerError)
	}
	if !res.Next() {
		return nil, NewDBError(fmt.Sprintf("no show found with id %v", newPiece.ShowID), http.StatusNotFound)
	}
	res.Close()

	createTime := time.Now()
	result, err := tx.Exec(`INSERT INTO Pieces (PieceName, ChoreographerID, ShowID, CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
		newPiece.Name, newPiece.ChoreographerID, newPiece.ShowID, createTime, newPiece.CreatedBy, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting piece: %v", err), http.StatusInternalServerError)
	}
	pieceID, err := result.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving last insert id: %v", err), http.StatusInternalServerError)
	}
	piece := &Piece{
		ID:              int(pieceID),
		ChoreographerID: newPiece.ChoreographerID,
		Name:            newPiece.Name,
		ShowID:          newPiece.ShowID,
		CreatedBy:       newPiece.CreatedBy,
		CreatedAt:       createTime,
	}
	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return piece, nil
}

// GetPieceByID returns the show with the given ID.
func (store *Database) GetPieceByID(id int, includeDeleted bool) (*Piece, *DBError) {
	piece := &Piece{}
	err := store.db.QueryRow(`SELECT * FROM Pieces P WHERE P.PieceID = ? AND P.IsDeleted = FALSE`, id).Scan(
		&piece.ID, &piece.InfoSheetID, &piece.ChoreographerID, &piece.Name,
		&piece.ShowID, &piece.CreatedAt,
		&piece.CreatedBy, &piece.IsDeleted)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no piece found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving piece: %v", err), http.StatusInternalServerError)
	}
	return piece, nil
}

// GetChoreographerShowPiece gets the current piece in the show that the given
// choreographer is running, if it exists. Returns an error if one occurred.
func (store *Database) GetChoreographerShowPiece(showID, choreographerID int) (*Piece, *DBError) {
	pArr, dberr := handlePiecesFromDatabase(store.db.Query(`SELECT * FROM Pieces P
		WHERE P.ChoreographerID = ?
		AND P.ShowID = ?
		AND P.IsDeleted = FALSE`, choreographerID, showID))
	if dberr != nil {
		return nil, dberr
	}
	if len(pArr) == 0 {
		return nil, NewDBError("no pieces found", http.StatusNotFound)
	}
	return pArr[0], nil
}

// AssignChoreographerToPiece assigns the given user id as a
// choreographer to the given piece. Assumes the user is a valid
// choreographer user. Returns an error if one occurred.
func (store *Database) AssignChoreographerToPiece(userID, pieceID int) *DBError {
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	res, err := tx.Query(`SELECT * FROM Pieces P WHERE P.PieceID = ?`, pieceID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error retrieving piece from database: %v", err), http.StatusInternalServerError)
	}
	if !res.Next() {
		return NewDBError("no piece found with the given id", http.StatusNotFound)
	}
	res.Close()

	_, err = tx.Exec(`UPDATE Pieces SET Pieces.ChoreographerID = ? WHERE Pieces.PieceID = ?`, userID, pieceID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error adding choreographer to piece: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// DeletePieceByID marks the piece with the given ID as deleted.
func (store *Database) DeletePieceByID(id int) *DBError {
	_, err := store.db.Exec(`UPDATE Pieces SET IsDeleted = ? WHERE PieceID = ?`, true, id)
	return NewDBError(fmt.Sprintf("error deleting piece: %v", err), http.StatusInternalServerError)
}

// GetPiecesByUserID gets all pieces the given user is in.
func (store *Database) GetPiecesByUserID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT DISTINCT P.PieceID, P.ChoreographerID ,P.PieceName, P.ShowID, P.CreatedAt, P.CreatedBy,
	P.IsDeleted FROM Pieces P 
	JOIN UserPiece UP ON P.PieceID = UP.PieceID 
	WHERE UP.UserID = ?`
	if !includeDeleted {
		query += ` AND UP.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

// GetPiecesByShowID gets all pieces that are associated with the given show ID.
func (store *Database) GetPiecesByShowID(id, page int, includeDeleted bool) ([]*Piece, *DBError) {
	offset := getSQLPageOffset(page)
	query := `SELECT * FROM Pieces P Where P.ShowID = ?`
	if !includeDeleted {
		query += ` AND P.IsDeleted = false`
	}
	query += ` LIMIT 25 OFFSET ?`
	return handlePiecesFromDatabase(store.db.Query(query, id, offset))
}

// InsertNewPieceInfoSheet inserts the given pieceInfoSheet for the given PieceID.
// Returns the completed PieceInfoSheet if successful and a DBError if otherwise.
func (store *Database) InsertNewPieceInfoSheet(creator int, pieceID int, info *NewPieceInfoSheet) (*PieceInfoSheet, *DBError) {
	// validate that the piece exists
	_, dberr := store.GetPieceByID(pieceID, false)
	if dberr != nil {
		return nil, dberr
	}
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()

	insertTime := time.Now()

	// prepare the info to be returned to the client
	finalInfo := &PieceInfoSheet{
		ChorPhone:         info.ChorPhone,
		Title:             info.Title,
		RunTime:           info.RunTime,
		Composers:         info.Composers,
		MusicTitle:        info.MusicTitle,
		PerformedBy:       info.PerformedBy,
		MusicSource:       info.MusicSource,
		NumMusicians:      info.NumMusicians,
		RehearsalSchedule: info.RehearsalSchedule,
		ChorNotes:         info.ChorNotes,
		CostumeDesc:       info.CostumeDesc,
		ItemDesc:          info.ItemDesc,
		LightingDesc:      info.LightingDesc,
		OtherNotes:        info.OtherNotes,
		CreatedAt:         insertTime,
		CreatedBy:         creator,
		IsDeleted:         false,
	}

	// prepare the slice of final piece musicians to be added
	// to the final info that will be returned to the client
	finalMusicians := make([]*PieceMusician, 0, info.NumMusicians)

	res, err := tx.Exec(`INSERT INTO PieceInfoSheet
		(ChoreographerPhone, Title, RunTime, Composers, MusicTitle,
		PerformedBy, MusicSource, NumMusicians, RehearsalSchedule,
		ChorNotes, CostumeDesc, ItemDesc, LightingDesc, OtherNotes,
		CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		info.ChorPhone, info.Title, info.RunTime, info.Composers, info.MusicTitle,
		info.PerformedBy, info.MusicSource, info.NumMusicians,
		info.RehearsalSchedule, info.ChorNotes, info.CostumeDesc,
		info.ItemDesc, info.LightingDesc, info.OtherNotes, insertTime, creator, false)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error inserting piece info: %v", err), http.StatusInternalServerError)
	}
	infoID, err := res.LastInsertId()
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error getting piece info id: %v", err), http.StatusInternalServerError)
	}
	finalInfo.PieceInfoID = infoID

	for _, newMusician := range info.Musicians {
		musician := &PieceMusician{
			Name:      newMusician.Name,
			Phone:     newMusician.Phone,
			Email:     newMusician.Email,
			CreatedAt: insertTime,
			CreatedBy: creator,
			IsDeleted: false,
		}
		res, err = tx.Exec(`INSERT INTO Musician (Name, Phone, Email,
		CreatedAt, CreatedBy, IsDeleted) VALUES (?, ?, ?, ?, ?, ?)`,
			newMusician.Name, newMusician.Phone, newMusician.Email, insertTime, creator, false)
		if err != nil {
			return nil, NewDBError(fmt.Sprintf("error inserting musician: %v", err), http.StatusInternalServerError)
		}
		musicianID, err := res.LastInsertId()
		if err != nil {
			return nil, NewDBError(fmt.Sprintf("error getting musician ID: %v", err), http.StatusInternalServerError)
		}
		musician.ID = musicianID
		finalMusicians = append(finalMusicians, musician)

		_, err = tx.Exec(`INSERT INTO PieceInfoMusician (PieceInfoID, MusicianID, CreatedAt, CreatedBy, IsDeleted)
		VALUES (?, ?, ?, ?, ?)`, infoID, musicianID, insertTime, creator, false)
		if err != nil {
			return nil, NewDBError(fmt.Sprintf("error inserting piece info musician link: %v", err), http.StatusInternalServerError)
		}
	}
	finalInfo.Musicians = finalMusicians

	_, err = tx.Exec(`UPDATE Pieces SET InfoSheetID = ? WHERE PieceID = ?`, infoID, pieceID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error setting piece's info sheet id: %v", err), http.StatusInternalServerError)
	}

	if err = tx.Commit(); err != nil {
		return nil, NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return finalInfo, nil
}

// GetPieceInfoSheet returns the piece's info sheet if it exists. Returns an error
// if one occurred.
func (store *Database) GetPieceInfoSheet(pieceID int) (*PieceInfoSheet, *DBError) {
	piece, dberr := store.GetPieceByID(pieceID, false)
	if dberr != nil {
		return nil, dberr
	}
	if piece.InfoSheetID == 0 {
		return nil, NewDBError("piece does not have an info sheet", http.StatusNotFound)
	}
	rows, err := store.db.Query(`SELECT * FROM PieceInfoSheet PIS WHERE PIS.PieceInfoID = ?`, piece.InfoSheetID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving piece info sheet: %v", err), http.StatusInternalServerError)
	}
	defer rows.Close()
	if !rows.Next() {
		return nil, NewDBError("no piece info sheet found", http.StatusNotFound)
	}
	is := &PieceInfoSheet{}
	if err = rows.Scan(&is.PieceInfoID, &is.ChorPhone, &is.Title, &is.RunTime,
		&is.Composers, &is.MusicTitle, &is.PerformedBy, &is.MusicSource,
		&is.NumMusicians, &is.RehearsalSchedule, &is.ChorNotes,
		&is.CostumeDesc, &is.ItemDesc, &is.LightingDesc, &is.OtherNotes,
		&is.CreatedAt, &is.CreatedBy, &is.IsDeleted); err != nil {
		return nil, NewDBError(fmt.Sprintf("error scanning result into info sheet: %v", err), http.StatusInternalServerError)
	}
	rows, err = store.db.Query(`SELECT M.MusicianID, M.Name, M.Phone,
		M.Email, M.CreatedAt, M.CreatedBy,
		M.IsDeleted FROM Musician M
		JOIN PieceInfoMusician PIM ON M.MusicianID = PIM.MusicianID
		WHERE PIM.PieceInfoID = ?`, is.PieceInfoID)
	if err != nil {
		return nil, NewDBError(fmt.Sprintf("error retrieving piece musicians: %v", err), http.StatusInternalServerError)
	}
	musicians := make([]*PieceMusician, 0, is.NumMusicians)
	for rows.Next() {
		musician := &PieceMusician{}
		if err = rows.Scan(&musician.ID, &musician.Name, &musician.Phone, &musician.Email,
			&musician.CreatedAt, &musician.CreatedBy, &musician.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning row into info musician: %v", err), http.StatusInternalServerError)
		}
		musicians = append(musicians, musician)
	}
	is.Musicians = musicians
	return is, nil
}

// DeletePieceInfoSheet deletes the given piece's info sheet, if it exists.
// Returns a DBError if one occurred.
func (store *Database) DeletePieceInfoSheet(pieceID int) *DBError {
	piece, dberr := store.GetPieceByID(pieceID, false)
	if dberr != nil {
		return dberr
	}
	if piece.InfoSheetID == 0 {
		return NewDBError("piece has no info sheet", http.StatusNotFound)
	}
	tx, err := store.db.Begin()
	if err != nil {
		return NewDBError(fmt.Sprintf("error beginning transaction: %v", err), http.StatusInternalServerError)
	}
	defer tx.Rollback()
	_, err = tx.Exec(`UPDATE PieceInfoSheet SET IsDeleted = TRUE WHERE PieceInfoID = ?`, piece.InfoSheetID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error deleting piece info sheet: %v", err), http.StatusInternalServerError)
	}
	_, err = tx.Exec(`UPDATE Pieces SET InfoSheetID = 0 WHERE PieceID = ?`, pieceID)
	if err != nil {
		return NewDBError(fmt.Sprintf("error marking piece as having no info sheet: %v", err), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		return NewDBError(fmt.Sprintf("error committing transaction: %v", err), http.StatusInternalServerError)
	}
	return nil
}

// handlePiecesFromDatabase compiles the given result and err into a slice of pieces or an error.
func handlePiecesFromDatabase(result *sql.Rows, err error) ([]*Piece, *DBError) {
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError("no pieces found", http.StatusNotFound)
		}
		return nil, NewDBError(fmt.Sprintf("error retrieving pieces from database: %v", err), http.StatusInternalServerError)
	}
	pieces := make([]*Piece, 0)
	for result.Next() {
		piece := &Piece{}
		if err = result.Scan(&piece.ID, &piece.InfoSheetID, &piece.ChoreographerID, &piece.Name, &piece.ShowID,
			&piece.CreatedAt, &piece.CreatedBy, &piece.IsDeleted); err != nil {
			return nil, NewDBError(fmt.Sprintf("error scanning result into pieces: %v", err), http.StatusInternalServerError)
		}
		pieces = append(pieces, piece)
	}
	return pieces, nil
}
