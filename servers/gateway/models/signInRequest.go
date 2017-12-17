package models

// SignInRequest defines the data that the server will
// expect for a sign in request
type SignInRequest struct {
	Email    string
	Password string
}
