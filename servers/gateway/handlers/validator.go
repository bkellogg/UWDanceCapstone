package handlers

// Validator defines structs that can be validated.
type Validator interface {
	// Validate validates the current struct
	// and returns an error if one occurred.
	// Returns nil if validation was successful.
	Validate() error
}
