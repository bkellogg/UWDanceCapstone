package models

// RoleID represents how a role is stored in the system,
type Role struct {
	ID          int64  `json:"id"`
	Name        string `json:"name"`
	DisplayName string `json:"displayName"`
	Level       int64  `json:"level"`
}
