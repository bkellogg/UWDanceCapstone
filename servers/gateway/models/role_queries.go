package models

import (
	"database/sql"
	"fmt"
	"net/http"
)

// InsertRole inserts the given role into the database and returns
// the resulting role. Returns an error if one occurred.
func (store *Database) InsertRole(role *NewRole) (*Role, *DBError) {
	tx, err := store.db.Begin()
	if err != nil {
		return nil, NewDBError("error beginning transaction: "+err.Error(), http.StatusInternalServerError)
	}
	roles, dbErr := parseRolesFromDatabase(tx.Query(`SELECT * FROM ROLE R
		Where R.RoleName = ? OR R.RoleDisplayName = ?`, role.Name, role.DisplayName))
	if dbErr != nil {
		tx.Rollback()
		return nil, dbErr
	}
	// if we found roles, then one exists with that name or display name
	if len(roles) != 0 {
		tx.Rollback()
		return nil, NewDBError("role already exists with that name or display name", http.StatusBadRequest)
	}
	result, err := tx.Exec(`INSERT INTO Role (RoleName, RoleDisplayName, RoleLevel, IsDeleted) VALUES (?, ?, ?, ?)`,
		role.Name, role.DisplayName, role.Level, false)
	if err != nil {
		tx.Rollback()
	}
	insertID, err := result.LastInsertId()
	if err != nil {
		tx.Rollback()
		return nil, NewDBError("error getting insert id of role: "+err.Error(), http.StatusInternalServerError)
	}
	if err = tx.Commit(); err != nil {
		tx.Rollback()
		return nil, NewDBError("error committing transaction: "+err.Error(), http.StatusInternalServerError)
	}
	insertedRole := &Role{
		ID:          insertID,
		Name:        role.Name,
		DisplayName: role.DisplayName,
		Level:       role.Level,
		IsDeleted:   false,
	}
	return insertedRole, nil
}

// GetRoleByName gets the role associated with that name. Returns
// an error if one occurred.
func (store *Database) GetRoleByName(name string) (*Role, *DBError) {
	res, err := store.db.Query(`SELECT * FROM Role R Where R.RoleName = ?`, name)
	if err != nil {
		dbErr := NewDBError(err.Error(), http.StatusInternalServerError)
		if err == sql.ErrNoRows {
			dbErr.HTTPStatus = http.StatusNotFound
			dbErr.Message = fmt.Sprintf("no roles found with name '%s", name)
		}
		return nil, dbErr
	}
	defer res.Close()
	role := &Role{}
	if res.Next() {
		if err = res.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level, &role.IsDeleted); err != nil {
			return nil, NewDBError("error scanning result into role: "+err.Error(), http.StatusInternalServerError)
		}
	} else {
		return nil, NewDBError(fmt.Sprintf("no roles found with name '%s", name), http.StatusNotFound)
	}
	return role, nil
}

// GetRoleByID gets the role associated with that id. Returns
// an error if one occurred.
func (store *Database) GetRoleByID(id int) (*Role, *DBError) {
	res, err := store.db.Query(`SELECT * FROM Role R Where R.RoleID = ?`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, NewDBError(fmt.Sprintf("no role found with id '%s'", id), http.StatusNotFound)
		}
		return nil, NewDBError("error querying role by id: "+err.Error(), http.StatusInternalServerError)
	}
	defer res.Close()
	role := &Role{}
	if res.Next() {
		if err = res.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level, &role.IsDeleted); err != nil {
			return nil, NewDBError("error scanning result into role: "+err.Error(), http.StatusInternalServerError)
		}
	} else {
		return nil, NewDBError(fmt.Sprintf("no role found with id '%s'", id), http.StatusNotFound)
	}
	return role, nil
}

// GetRoles returns a slice of pointers to roles that are in
// the database, or an error if one occurred. If there are no
// roles, an empty slice is returned but no error.
func (store *Database) GetRoles() ([]*Role, *DBError) {
	return parseRolesFromDatabase(store.db.Query(`SELECT * FROM Role R`))
}

// parseRolesFromDatabase compiles the given result and err into a slice of roles or an error.
func parseRolesFromDatabase(result *sql.Rows, err error) ([]*Role, *DBError) {
	roles := make([]*Role, 0)
	if err != nil {
		if err == sql.ErrNoRows {
			return roles, nil
		}
		return nil, NewDBError("error querying roles: "+err.Error(), http.StatusInternalServerError)
	}
	defer result.Close()
	for result.Next() {
		r := &Role{}
		if err = result.Scan(&r.ID, &r.Name, &r.DisplayName, &r.Level, &r.IsDeleted); err != nil {
			return nil, NewDBError("error scanning result into role: "+err.Error(), http.StatusInternalServerError)
		}
		roles = append(roles, r)
	}
	return roles, nil
}
