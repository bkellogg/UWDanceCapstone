package notify

import (
	"fmt"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
	"github.com/gorilla/websocket"
)

//WebSocketsHandler is a handler for WebSocket upgrade requests
type WebSocketsHandler struct {
	sessionStore sessions.Store
	sessionKey   string
	notifier     *Notifier
	upgrader     *websocket.Upgrader
}

//NewWebSocketsHandler constructs a new WebSocketsHandler
func NewWebSocketsHandler(notifier *Notifier, store sessions.Store, sessionKey string) *WebSocketsHandler {
	return &WebSocketsHandler{
		sessionStore: store,
		sessionKey:   sessionKey,
		notifier:     notifier,
		upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
	}
}

//ServeHTTP implements the http.Handler interface for the WebSocketsHandler
func (wsh *WebSocketsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	user, err := sessions.GetUserFromRequest(r, wsh.sessionKey, wsh.sessionStore)
	if err != nil {
		http.Error(w, appvars.ErrNotSignedIn, http.StatusUnauthorized)
		return
	}
	conn, err := wsh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, fmt.Sprintf("error upgrading to WebSocket connection: %v", err), http.StatusInternalServerError)
		return
	}
	wsh.notifier.AddClient(user, conn)
}

// Notifier is an object that handles WebSocket notifications
type Notifier struct {
	clients       map[int64]*WebSocketClient
	eventQ        chan *WebSocketEvent
	newClientQ    chan *WebSocketClient
	removeClientQ chan *WebSocketClient
}

// NewNotifier constructs a new Notifier
func NewNotifier() *Notifier {
	n := &Notifier{
		clients:       make(map[int64]*WebSocketClient),
		eventQ:        make(chan *WebSocketEvent),
		newClientQ:    make(chan *WebSocketClient),
		removeClientQ: make(chan *WebSocketClient),
	}
	go n.start()
	return n
}

// AddClient adds a new client to the Notifier
func (n *Notifier) AddClient(u *models.User, c *websocket.Conn) {
	client := NewWebSocketClient(u, c)
	n.newClientQ <- client
	n.readControlMessages(u.ID, c)
}

// Notify broadcasts the event to all WebSocket clients
func (n *Notifier) Notify(event *WebSocketEvent) {
	n.eventQ <- event
}

// start starts the notification loop
func (n *Notifier) start() {
	for {
		select {
		case event := <-n.eventQ:
			for _, client := range n.clients {
				if client.writeToAll(event) {
					n.removeClientQ <- client
				}
			}
		case clientToAdd := <-n.newClientQ:
			if existingClient, ok := n.clients[clientToAdd.user.ID]; ok {
				existingClient.addConnections(clientToAdd.conns[:]...)
			} else {
				n.clients[clientToAdd.user.ID] = clientToAdd
			}
		case clientToRemove := <-n.removeClientQ:
			clientToRemove.mx.Lock()
			delete(n.clients, clientToRemove.user.ID)
			clientToRemove.mx.Unlock()
		}
	}
}

// readControlMessages reads and discards all control messages
// send from the client, but if a read fails, it removes the given
// WebSocketClient from the notifier
func (n *Notifier) readControlMessages(userID int64, conn *websocket.Conn) {
	for {
		if _, _, err := conn.NextReader(); err != nil {
			break
		}
	}
	wsc, ok := n.clients[userID]
	if !ok {
		return
	}
	wsc.removeConn(conn)
	if !wsc.hasConnections() {
		n.removeClientQ <- wsc
	}

}
