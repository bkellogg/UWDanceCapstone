package notify

import (
	"fmt"
	"log"
	"net/http"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/models"
	"github.com/BKellogg/UWDanceCapstone/servers/gateway/sessions"
	"github.com/gorilla/websocket"
)

// ClientReader represents channel and a clientID
// that when read from will return the client at
// the given clientID.
type ClientReader struct {
	clientID   int64
	clientChan chan *WebSocketClient
}

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
	readClientQ   chan *ClientReader
}

// NewNotifier constructs a new Notifier
func NewNotifier() *Notifier {
	n := &Notifier{
		clients:       make(map[int64]*WebSocketClient),
		eventQ:        make(chan *WebSocketEvent, 3),
		newClientQ:    make(chan *WebSocketClient, 3),
		removeClientQ: make(chan *WebSocketClient, 3),
		readClientQ:   make(chan *ClientReader),
	}
	go n.start()
	return n
}

// GetClient returns the WebSocketClient associated with the given
// id. Will return nil and false if the id does not match a known
// client, but will not report an error.
func (n *Notifier) GetClient(id int64) (*WebSocketClient, bool) {
	client := <-n.getClientReader(id)
	return client, client != nil
}

// getClientReader returns a channel that when read from returns the client
// at the given id.
func (n *Notifier) getClientReader(id int64) chan *WebSocketClient {
	res := make(chan *WebSocketClient)
	n.readClientQ <- &ClientReader{clientID: id, clientChan: res}
	return res
}

// AddClient adds a new client to the Notifier
func (n *Notifier) AddClient(u *models.User, c *websocket.Conn) {
	client := newWebSocketClient(u, c)
	n.newClientQ <- client
	n.readControlMessages(u.ID, c)
}

// Notify broadcasts the event to all WebSocket clients
func (n *Notifier) Notify(event *WebSocketEvent) {
	log.Printf("adding event to the queue\n")
	n.eventQ <- event
	log.Printf("finished adding event to the queue\n")
}

// start starts the notification loop
func (n *Notifier) start() {
	// in the event that the notifier loop exits, restart the loop
	defer func() {
		log.Printf("notifier loop exited...restarting\n")
		n.start()
	}()
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
		case readClient := <-n.readClientQ:
			readClient.clientChan <- n.clients[readClient.clientID]
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
