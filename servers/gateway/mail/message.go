package mail

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/smtp"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// Message defines the information needed to send a message
type Message struct {
	auth       smtp.Auth
	Recipients []string `json:"recipients"`
	sender     string   `json:"sender"`
	Subject    string   `json:"subject"`
	Body       string   `json:"body"`
}

// NewMessage creates a new mail message from the given information
func NewMessage(credentials *Credentials, sender, body, subject string, recipients []string) *Message {
	return &Message{
		auth:       credentials.toSMTPAuth(),
		sender:     sender,
		Recipients: recipients,
		Subject:    subject,
		Body:       body,
	}
}

// NewMessageFromTemplate creates a new
func NewMessageFromTemplate(credentials *Credentials, tpl, subject string,
	tplVars interface{}, recipients []string) (*Message, error) {
	parsedTpl, err := parseTemplate(tpl, tplVars)
	if err != nil {
		return nil, err
	}
	return &Message{
		auth:       credentials.toSMTPAuth(),
		sender:     appvars.StageEmailAddress,
		Recipients: recipients,
		Subject:    subject,
		Body:       parsedTpl,
	}, nil
}

// NewMessageFromRequest builds and returns a new message from the given credentials
// and http.Request. Consumes the given requests's body.
func NewMessageFromRequest(credentials *Credentials, r *http.Request) (*Message, error) {
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
	if len(m.sender) == 0 {
		m.sender = appvars.StageEmailAddress
	}
	return smtp.SendMail(gmailAddr, m.auth, m.sender, m.Recipients, []byte(m.Body))
}

// addHeaders adds the basic headers to the message body
func (m *Message) addHeaders() {
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	subject := fmt.Sprintf("Subject: %s", "[UW STAGE] "+m.Subject)
	from := fmt.Sprintf("From: UW STAGE <ischooldancecap@gmail.com>")
	allHeaders := []byte(fmt.Sprintf("%s\n%s\n%s\n\n", subject, from, mime))
	bodyBytes := []byte(m.Body)
	bodyBytes = append(allHeaders, bodyBytes...)
	m.Body = string(bodyBytes)

}
