package models

// SignUpRequest defines the structure of a request for
// a new user sign up
type SignUpRequest struct {
	UserName     string `json:"userName,omitempty"`
	FirstName    string `json:"firstName,omitempty"`
	LastName     string `json:"lastName,omitempty"`
	Password     string `json:"password,omitempty"`
	PasswordConf string `json:"passwordConf,omitempty"`
}
