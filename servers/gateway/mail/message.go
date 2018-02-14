package mail

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"
)

// Message defines the information needed to send a message
type Message struct {
	auth       smtp.Auth
	Recipients []string `json:"recipients"`
	Sender     string   `json:"sender"`
	Subject    string   `json:"subject"`
	Body       string   `json:"body"`
}

// NewMessage creates a new mail message from the given information
func NewMessage(credentials *MailCredentials, sender, body, subject string, recipients []string) *Message {
	return &Message{
		auth:       credentials.toSMTPAuth(),
		Sender:     sender,
		Recipients: recipients,
		Subject:    subject,
		Body:       body,
	}
}

// NewMessageFromRequest builds and returns a new message from the given credentials
// and http.Request. Consumes the given requests's body.
func NewMessageFromRequest(credentials *MailCredentials, r *http.Request) (*Message, error) {
	msg := &Message{}
	if err := json.NewDecoder(r.Body).Decode(msg); err != nil {
		return nil, err
	}
	msg.auth = credentials.toSMTPAuth()
	return msg, nil
}

// Send sends "this" message
func (m *Message) Send() error {
	m.addHeaders()
	m.addFooter()
	if len(m.Sender) == 0 {
		m.Sender = stageEmailAddress
	}
	return smtp.SendMail(gmailAddr, m.auth, m.Sender, m.Recipients, []byte(m.Body))
}

// addHeaders adds the basic headers to the message body
func (m *Message) addHeaders() {
	subject := fmt.Sprintf("Subject: %s", "[UW STAGE] "+m.Subject)
	from := fmt.Sprintf("From: UW STAGE <ischooldancecap@gmail.com>")
	allHeaders := []byte(fmt.Sprintf("%s\n%s\n\n", subject, from))
	bodyBytes := []byte(m.Body)
	bodyBytes = append(allHeaders, bodyBytes...)
	m.Body = string(bodyBytes)

}

// addFooter adds a no reply message to the bottom of the message
func (m *Message) addFooter() {
	bodyBytes := []byte(m.Body)
	bodyBytes = append(bodyBytes, []byte(`

===================
This mail inbox is not monitored. No one will reply to messages sent to this address,
but feel free to have a conversation with yourself. Note that you'll have to supply
both sides of the conversation! :)

Thank you,
UW STAGE Team`)...)
	m.Body = string(bodyBytes)
}
