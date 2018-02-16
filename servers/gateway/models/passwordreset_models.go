package models

// PasswordResetRequest represents how a password reset
// confirmation request is sent tio the server.
type PasswordResetRequest struct {
	Token        string `json:"token"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
}

// PasswordResetTPL defines the variables that will be inserted
// into a password reset email HTML template.
type PasswordResetTPL struct {
	Name string
	URL  string
}
