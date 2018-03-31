package models

import (
	"database/sql"
	"fmt"
	"net/http"
)

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
	role := &Role{}
	if res.Next() {
		if err = res.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level); err != nil {
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
	role := &Role{}
	if res.Next() {
		if err = res.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level); err != nil {
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
	for result.Next() {
		r := &Role{}
		if err = result.Scan(&r.ID, &r.Name, &r.DisplayName, &r.Level); err != nil {
			return nil, NewDBError("error scanning result into role: "+err.Error(), http.StatusInternalServerError)
		}
		roles = append(roles, r)
	}
	return roles, nil
}
