package constants

const (
	ErrNotSignedIn            = "you must be signed in to use this resource"
	ErrPermissionDenied       = "you do not have access to this resource"
	ErrMethodNotAllowed       = "request method is not supported on this resource"
	ErrObjectTypeNotSupported = "object type is not supported on this resource"
	ErrResourceDoesNotExist   = "requested esource type does not exist"
	ErrDatabaseLookupFailed   = "error retrieving information from the database"

	ErrPasswordResetTokensMismatch = "password reset tokens mismatched"
	ErrPasswordNotLongEnough       = "password is not long enough"
	ErrPasswordsMismatch           = "passwords do not match"

	ErrReceiveIntoStructFailed = "malformed JSON prevented request decoding"
	ErrBioTooManyCharacters    = "the provided bio contains too many characters"
	ErrBioTooManyWords         = "the provided bio contains too many words"

	ErrInvalidHistoryOption = "invalid history option"

	ErrUnparsableIDGiven = "unparsable ID given"
)
