package notify

import (
	"fmt"
	"sync"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/gorilla/websocket"
)

// WebSocketClient represents how a websocket client
// is stored on the server,
type WebSocketClient struct {
	conns []*websocket.Conn
	user  *models.User
	mx    sync.RWMutex // necessary for safely removing specific connecitons
}

// NewWebSocketClient creates a new websocket client from the
// given information.
func NewWebSocketClient(u *models.User, c *websocket.Conn) *WebSocketClient {
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

// addConnection adds the given connections to this WebSocketClient
func (c *WebSocketClient) addConnections(conn ...*websocket.Conn) {
	if conn != nil {
		c.mx.Lock()
		c.conns = append(c.conns, conn...)
		c.mx.Unlock()
	}
	fmt.Println()
	fmt.Print("after add ")
	fmt.Println(c.conns)
}

// hasConnections returns true if this WebSocketConnection has connections
func (c *WebSocketClient) hasConnections() bool {
	return len(c.conns) > 0
}

// shouldRecieveEvent returns true if this client should recieve the
// given event.
func (c *WebSocketClient) shouldRecieveEvent(e *WebSocketEvent) bool {
	if e.EventType == EventTypeAnnouncement {
		return true
	}
	return true // TODO: temp
}

// writeToAll writes the given WebSocketEvent to every connection
// for this WebSocketClient if the client should recieve it.
// Purges any connection that has errors when being written to.
// Returns true if this WebSocketClient should be removed, false
// if otherwise.
func (c *WebSocketClient) writeToAll(e *WebSocketEvent) bool {
	if !c.shouldRecieveEvent(e) {
		return false
	}
	for i, conn := range c.conns {
		if err := conn.WriteJSON(e); err != nil {
			fmt.Printf("calling removeCon from writetoall at index %b\n", i)
			c.removeConnAtIndex(i)
		}
	}
	return !c.hasConnections()
}

// removeConnAtIndex removes the connection at the given index
// from this WebSocketClient. Does nothing if given an index out of range.
func (c *WebSocketClient) removeConnAtIndex(i int) {
	c.mx.Lock()
	defer c.mx.Unlock()
	fmt.Println(c.conns)
	fmt.Printf("removing connection at index %d\n", i)
	if i >= len(c.conns) || i < 0 {
		return
	}
	fmt.Printf("len of conns slice: %d\n", len(c.conns))
	conn := c.conns[i]
	if conn != nil {
		conn.Close()
	}
	fmt.Println(c.conns)
	c.conns = append(c.conns[:i], c.conns[i+1:]...)
	fmt.Println(c.conns)
}

func (c *WebSocketClient) removeConn(connToRemove *websocket.Conn) {
	newConns := make([]*websocket.Conn, 0, len(c.conns)-1)
	for _, conn := range c.conns {
		if conn != connToRemove {
			newConns = append(newConns, conn)
		}
	}
	c.conns = newConns
}
