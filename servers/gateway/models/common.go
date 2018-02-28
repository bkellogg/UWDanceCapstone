package models

import "github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"

// getSQLPageOffset gets the SQL Offset number to get the given set
func getSQLPageOffset(page int) int {
	return (page - 1) * appvars.SQLDefaultPageSize
}
