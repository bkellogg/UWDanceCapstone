package models

import (
	"database/sql"
	"errors"
)

// GetRoleByName gets the role associated with that name. Returns
// an error if one occurred.
func (store *Database) GetRoleByName(name string) (*Role, error) {
	res, err := store.db.Query(`SELECT * FROM Role R Where R.RoleName = ?`, name)
	if err != nil {
		return nil, err
	}
	role := &Role{}
	if res.Next() {
		if err = res.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level); err != nil {
			return nil, err
		}
	} else {
		return nil, sql.ErrNoRows
	}
	return role, nil
}

// GetRoleByID gets the role associated with that id. Returns
// an error if one occurred.
func (store *Database) GetRoleByID(id int) (*Role, error) {
	res, err := store.db.Query(`SELECT * FROM Role R Where R.RoleID = ?`, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, err
		}
		return nil, errors.New("error selecting roles: " + err.Error())
	}
	role := &Role{}
	if res.Next() {
		if err = res.Scan(&role.ID, &role.Name, &role.DisplayName, &role.Level); err != nil {
			return nil, errors.New("error scanning row into role: " + err.Error())
		}
	} else {
		return nil, sql.ErrNoRows
	}
	return role, nil
}

// GetRoles returns a slice of pointers to roles that are in
// the database, or an error if one occurred. If there are no
// roles, an empty slice is returned but no error.
func (store *Database) GetRoles() ([]*Role, error) {
	return parseRolesFromDatabase(store.db.Query(`SELECT * FROM Role R`))
}

// parseRolesFromDatabase compiles the given result and err into a slice of roles or an error.
func parseRolesFromDatabase(result *sql.Rows, err error) ([]*Role, error) {
	roles := make([]*Role, 0)
	if err != nil {
		if err == sql.ErrNoRows {
			return roles, nil
		}
		return nil, err
	}
	for result.Next() {
		r := &Role{}
		if err = result.Scan(&r.ID, &r.Name, &r.DisplayName, &r.Level); err != nil {
			return nil, err
		}
		roles = append(roles, r)
	}
	return roles, nil
}
