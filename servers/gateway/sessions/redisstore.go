package sessions

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/go-redis/redis"
)

// RedisStore represents a session.Store backed by redis.
type RedisStore struct {
	//Redis client used to talk to redis server.
	Client *redis.Client
	//Used for key expiry time on redis.
	SessionDuration time.Duration
}

// DefaultSessionDuration is the default length of the redis client's
// expiry time that will be used if a valid sessionDuration is not given
const DefaultSessionDuration = time.Hour

// NewRedisStore constructs a new RedisStore
func NewRedisStore(client *redis.Client, sessionDuration time.Duration, addr string) *RedisStore {
	if len(addr) == 0 {
		addr = "127.0.0.1:6379"
	}
	//initialize and return a new RedisStore struct
	redisOptions := redis.Options{
		Addr: addr,
	}
	var store RedisStore
	if client == nil {
		store.Client = redis.NewClient(&redisOptions)
	} else {
		store.Client = client
	}

	if sessionDuration < 0 {
		store.SessionDuration = DefaultSessionDuration
	} else {
		store.SessionDuration = sessionDuration
	}
	return &store
}

// Save saves the provided `sessionState` and associated SessionID to the store.
// The `sessionState` parameter is typically a pointer to a struct containing
// all the data you want to associated with the given SessionID.
func (rs *RedisStore) Save(sid SessionID, sessionState interface{}) error {
	marshalledState, err := json.Marshal(sessionState)
	if err != nil {
		return errors.New("error marshalling JSON: " + err.Error())
	}

	status := rs.Client.Set(sid.getRedisKey(), marshalledState, rs.SessionDuration)
	return status.Err()
}

// Get populates `sessionState` with the data previously saved
// for the given SessionID
func (rs *RedisStore) Get(sid SessionID, sessionState interface{}) error {
	pipe := rs.Client.Pipeline()
	session := pipe.Get(sid.getRedisKey())
	pipe.Expire(sid.getRedisKey(), rs.SessionDuration)
	_, err := pipe.Exec()
	if err != nil {
		if err == redis.Nil {
			return ErrStateNotFound
		}
		return err
	}

	sessionBytes, err := session.Bytes()
	if err != nil {
		return err
	}
	err = json.Unmarshal(sessionBytes, &sessionState)
	if err != nil {
		return err
	}
	return nil
}

// Delete deletes all state data associated with the SessionID from the store.
func (rs *RedisStore) Delete(sid SessionID) error {
	err := rs.Client.Del(sid.getRedisKey())
	if err.Err() != nil {
		return err.Err()
	}
	return nil
}

// getRedisKey returns the redis key to use for the SessionID
func (sid SessionID) getRedisKey() string {
	return "sid:" + sid.String()
}
