package notify

import (
	"encoding/json"
)

const (
	EventTypeAnnouncement = "announcement"
	EventTypeCasting      = "casting"
)

// WebSocketEvent defines the structure of how an event will
// be sent over a websocket.
type WebSocketEvent struct {
	EventType string      `json:"eventType"`
	Data      interface{} `json:"data"`
}

// NewWebSocketEvent returns the given event and data as a
// WebSocketEVent to be sent over a websocket connection.
func NewWebSocketEvent(event string, data interface{}) (*WebSocketEvent, error) {
	return &WebSocketEvent{
		EventType: event,
		Data:      data,
	}, nil
}

// Prepare prepares this WebSocketEvent to be sent.
func (wse WebSocketEvent) prepare() []byte {
	bytes, _ := json.Marshal(wse)
	return bytes
}
