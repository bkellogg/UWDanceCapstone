package notify

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
)

//WebSocketsHandler is a handler for WebSocket upgrade requests
type WebSocketsHandler struct {
	notifier *Notifier
	upgrader *websocket.Upgrader
}

//NewWebSocketsHandler constructs a new WebSocketsHandler
func NewWebSocketsHandler(notifier *Notifier) *WebSocketsHandler {
	return &WebSocketsHandler{
		notifier: notifier,
		upgrader: &websocket.Upgrader{
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
			CheckOrigin:     func(r *http.Request) bool { return true },
		},
	}
}

//ServeHTTP implements the http.Handler interface for the WebSocketsHandler
func (wsh *WebSocketsHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, err := wsh.upgrader.Upgrade(w, r, nil)
	if err != nil {
		http.Error(w, fmt.Sprintf("error upgrading to WebSocket connection: %v", err), http.StatusInternalServerError)
		return
	}
	wsh.notifier.AddClient(conn)
}

//Notifier is an object that handles WebSocket notifications
type Notifier struct {
	clients       []*websocket.Conn
	eventQ        chan []byte
	addClientQ    chan *websocket.Conn
	removeClientQ chan *websocket.Conn
}

//NewNotifier constructs a new Notifier
func NewNotifier() *Notifier {
	n := &Notifier{
		eventQ:        make(chan []byte),
		addClientQ:    make(chan *websocket.Conn),
		removeClientQ: make(chan *websocket.Conn),
	}
	go n.start()
	return n
}

//AddClient adds a new client to the Notifier
func (n *Notifier) AddClient(client *websocket.Conn) {
	n.addClientQ <- client
	n.readControlMessages(client)
}

//Notify broadcasts the event to all WebSocket clients
func (n *Notifier) Notify(event *WebSocketEvent) {
	n.eventQ <- event.prepare()
}

//start starts the notification loop
func (n *Notifier) start() {
	for {
		select {
		case event := <-n.eventQ:
			for _, client := range n.clients {
				if err := client.WriteMessage(websocket.TextMessage, event); err != nil {
					n.removeClientQ <- client
				}
			}
		case clientToAdd := <-n.addClientQ:
			n.clients = append(n.clients, clientToAdd)
		case clientToRemove := <-n.removeClientQ:
			clientToRemove.Close()
			newClients := make([]*websocket.Conn, 0, len(n.clients)-1)
			for _, client := range n.clients {
				if client != clientToRemove {
					newClients = append(newClients, client)
				}
			}
			n.clients = newClients
		default:
		}
	}
}

//readControlMessages reads and discards all control messages
//send from the client, but if a read fails, it removes the
//client form the clients slice
func (n *Notifier) readControlMessages(client *websocket.Conn) {
	for {
		if _, _, err := client.NextReader(); err != nil {
			n.removeClientQ <- client
			break
		}
	}
}
