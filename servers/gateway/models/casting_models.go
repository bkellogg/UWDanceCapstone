package models

// CastingConfVars defines the variables that will be merged
// into the casting confirmation template.
type CastingConfVars struct {
	Name       string
	ChorFName  string
	ChorLName  string
	ExpiryTime string
	URL        string
}

// CastingConfResult defines how a single user cast result
// will be sent to the client. Since there a lot of ways for the
// cast to fail, we will include the message and if the user failed
// to have an invite created for them and have an email sent, etc.
type CastingConfResult struct {
	Dancer        *User  `json:"dancer"`
	InviteCreated bool   `json:"inviteCreated"`
	EmailSent     bool   `json:"emailSent"`
	IsError       bool   `json:"isError"`
	Message       string `json:"message,omitempty"`
}
