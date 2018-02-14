package models

type PasswordResetRequest struct {
	Token        string `json:"token"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
}
