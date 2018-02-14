package models

type PasswordResetRequest struct {
	Token        string `json:"token"`
	Password     sting  `json:"password"`
	PasswordConf string `json:"passwordConf"`
}
