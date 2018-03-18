package models

import "database/sql"

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
