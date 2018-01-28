package notify

import (
	"encoding/json"
)

const (
	EventTypeAnnouncement   = "announcement"
	EventTypeConflictUpdate = "conflictUpdate"
)

// WebSocketEvent defines the structure of how an event will
// be sent over a websocket.
type WebSocketEvent struct {
	Event string `json:"event"`
	Data  []byte `json:"data"`
}

// NewWebSocketEvent returns the given event and data as a
// WebSocketEVent to be sent over a websocket connection.
func NewWebSocketEvent(event string, data interface{}) (*WebSocketEvent, error) {
	dataBytes, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	return &WebSocketEvent{
		Event: event,
		Data:  dataBytes,
	}, nil
}

// Prepare prepares this WebSocketEvent to be sent.
func (wse WebSocketEvent) prepare() []byte {
	bytes, _ := json.Marshal(wse)
	return bytes
}
