package notify

import (
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/websocket"
)

// WebSocketClient represents how a websocket client
// is stored on the server,
type WebSocketClient struct {
	conns []*websocket.Conn
	user  *models.User
	mx    sync.RWMutex // necessary for safely removing specific connections
}

// newWebSocketClient creates a new websocket client from the
// given information.
func newWebSocketClient(u *models.User, c *websocket.Conn, isCasting bool) *WebSocketClient {
	wsc := &WebSocketClient{
		user: u,
	}
	if c != nil {
		wsc.mx.Lock()
		wsc.conns = append(wsc.conns, c)
		wsc.mx.Unlock()
	}
	return wsc
}

// addConnection adds the given connections to this WebSocketClient.
func (c *WebSocketClient) addConnections(conn ...*websocket.Conn) {
	if conn != nil {
		c.mx.Lock()
		c.conns = append(c.conns, conn...)
		c.mx.Unlock()
	}
}

// hasConnections returns true if this WebSocketConnection has connections.
func (c *WebSocketClient) hasConnections() bool {
	return len(c.conns) > 0
}

// shouldReceiveEvent returns true if this client should receive the
// given event.
func (c *WebSocketClient) shouldReceiveEvent(e *WebSocketEvent) bool {
	return c.user.ID == e.Recipient || e.Recipient < 1
}

// writeToAll writes the given WebSocketEvent to every connection
// for this WebSocketClient if the client should receive it.
// Purges any connection that has errors when being written to.
// Returns true if this WebSocketClient should be removed, false
// if otherwise.
func (c *WebSocketClient) writeToAll(e *WebSocketEvent) bool {
	if !c.shouldReceiveEvent(e) {
		return false
	}
	for _, conn := range c.conns {
		if err := conn.WriteJSON(e); err != nil {
			c.removeConn(conn)
		}
	}
	return !c.hasConnections()
}

// removeConn removes the given websocket conn from this WebSocketClient.
func (c *WebSocketClient) removeConn(connToRemove *websocket.Conn) {
	connToRemove.Close()
	newConnsLength := len(c.conns) - 1
	if newConnsLength < 0 {
		newConnsLength = 0
	}
	newConns := make([]*websocket.Conn, 0, newConnsLength)
	c.mx.Lock()
	defer c.mx.Unlock()
	for _, conn := range c.conns {
		if conn != connToRemove {
			newConns = append(newConns, conn)
		}
	}
	c.conns = newConns
}
