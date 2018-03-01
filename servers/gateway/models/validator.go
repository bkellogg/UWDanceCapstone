package models

type Validator interface {

	// validate returns an error if the struct
	// it is invoked on is not ready to be
	// inserted into the database. Will also
	// populate fields that do not require any
	// additional information, such as createdAt.
	validate() error
}
