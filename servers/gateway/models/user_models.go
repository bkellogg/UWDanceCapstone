package models

import (
	"errors"
	"net/mail"
	"strings"
	"time"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/Pallinder/go-randomdata"
	"golang.org/x/crypto/bcrypt"
)

// NewUserRequest defines the structure of a request for
// a new user sign up
type NewUserRequest struct {
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Email        string `json:"email"`
	Bio          string `json:"bio"`
	Password     string `json:"password"`
	PasswordConf string `json:"passwordConf"`
}

// User defines the properties of a specific user in the system
type User struct {
	ID        int64     `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	Bio       string    `json:"bio"`
	PassHash  []byte    `json:"-"`
	RoleID    int       `json:"roleID"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"createdAt"`
}

// UserResponse defines how a user is encoded back
// the the client.
type UserResponse struct {
	ID        int64     `json:"id"`
	FirstName string    `json:"firstName"`
	LastName  string    `json:"lastName"`
	Email     string    `json:"email"`
	Bio       string    `json:"bio"`
	Role      *Role     `json:"role"`
	Active    bool      `json:"active"`
	CreatedAt time.Time `json:"createdAt"`
}

// UserUpdates defines the information that users can change
// about their profile.
type UserUpdates struct {
	FirstName string `json:"firstName"`
	LastName  string `json:"lastName"`
	Bio       string `json:"bio"`
}

// UserAuditionLink defines the body of a request to
// add a user to an audition.
// UserID and AuditionID will come from request URI
type UserAuditionLink struct {
	Comment      string         `json:"comment,omitempty"`
	Availability *WeekTimeBlock `json:"availability,omitempty"`
}

// UserAudition represents how a link between a user and an audition
// is stored.
type UserAudition struct {
	ID             int       `json:"id"`
	AuditionID     int       `json:"auditionID"`
	UserID         int       `json:"userID"`
	AvailabilityID int       `json:"availabilityID"`
	NumShows       int       `json:"numShows"`
	CreatedAt      time.Time `json:"createdAt"`
	CreatedBy      int       `json:"createdBy"`
	IsDeleted      bool      `json:"isDeleted"`
}

// RoleChange defines how a role is sent to the server
type RoleChange struct {
	RoleName string `json:"roleName"`
}

// Validate validates the current role and returns an error if one occurred.
func (r *RoleChange) Validate() error {
	return nil
}

// Validate validates the current UserAuditionLink and returns
// an error if one occurred.
func (ual *UserAuditionLink) Validate() error {
	return ual.Availability.Validate()
}

// ToUser takes this *NewUserRequest and returns
// a *User from it
func (u *NewUserRequest) ToUser() (*User, error) {
	if err := u.validate(); err != nil {
		return nil, errors.New("new user validation failed: " + err.Error())
	}
	if err := u.checkBioLength(); err != nil {
		return nil, err
	}
	user := &User{
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Bio:       u.Bio,
		RoleID:    appvars.UserDefaultRole,
		Active:    true,
		CreatedAt: time.Now(),
	}
	return user, user.SetPassword(u.Password)
}

// checkBioLength returns an error if the bio is too long
// either by word count or character count.
func (u *NewUserRequest) checkBioLength() error {
	return checkBioLength(u.Bio)
}

// CheckBioLength returns an error if the bio is too long
// either by word count or character count.
func (u *UserUpdates) CheckBioLength() error {
	return checkBioLength(u.Bio)
}

// validate returns nil if this NewUserRequest is able to
// be turned into a user, otherwise returns an error stating
// why it cannot be.
func (u *NewUserRequest) validate() error {
	if len(u.FirstName) == 0 {
		return errors.New("new user first name must exist")
	}
	if len(u.LastName) == 0 {
		return errors.New("new user last name must exist")
	}
	if _, err := mail.ParseAddress(u.Email); err != nil {
		return errors.New("new users must supply a valid email address")
	}
	if len(u.Password) < 6 {
		return errors.New("new users must have a password")
	}
	if len(u.Password) != len(u.PasswordConf) {
		return errors.New("passwords do not match")
	}
	u.FirstName = strings.Title(u.FirstName)
	u.LastName = strings.Title(u.LastName)
	u.Email = strings.ToLower(u.Email)
	return nil
}

// SetPassword hashes the given password and sets it as this users passHash
func (u *User) SetPassword(password string) error {
	passHash, err := bcrypt.GenerateFromPassword([]byte(password), appvars.BCryptDefaultCost)
	if err != nil {
		return err
	}
	u.PassHash = passHash
	return nil
}

// Authenticate (s) the given user with the given password. Returns an error if
// the authentication failed.
func (u *User) Authenticate(password string) error {
	if err := bcrypt.CompareHashAndPassword(u.PassHash, []byte(password)); err != nil {
		return errors.New("invalid credentials")
	}
	return nil
}

// ConvertUserToUserResponse converts the given user to a User
// prepared to be written back to the client.
func (store *Database) ConvertUserToUserResponse(u *User) (*UserResponse, error) {
	userResponse := &UserResponse{
		ID:        u.ID,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Bio:       u.Bio,
		Active:    u.Active,
		CreatedAt: u.CreatedAt,
	}
	role, err := store.GetRoleByID(u.RoleID)
	if err != nil {
		return nil, errors.New(err.Message)
	}
	userResponse.Role = role
	return userResponse, nil
}

// generateRandomUser creates a random user and returns it
func generateRandomUser() *User {
	user := &User{
		FirstName: randomdata.FirstName(randomdata.RandomGender),
		LastName:  randomdata.LastName(),
		Email:     randomdata.Email(),
		RoleID:    appvars.UserDefaultRole,
	}
	user.SetPassword(randomdata.FirstName(randomdata.RandomGender) + randomdata.Street())
	return user
}

// checkBioLength returns an error if the bio is too long
// either by word count or character count.
func checkBioLength(bio string) error {
	if len(bio) > appvars.ProfileBioMaxCharacters {
		return errors.New(appvars.ErrBioTooManyCharacters)
	}
	if len(strings.Fields(bio)) > appvars.ProfileBioMaxWords {
		return errors.New(appvars.ErrBioTooManyWords)
	}
	return nil
}
