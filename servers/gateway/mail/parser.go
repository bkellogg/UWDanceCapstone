package mail

import (
	"bytes"
	"html/template"
)

// parseTemplate merges the given template with the given values and returns it as a string.
// Returns an error if one occurred.
func parseTemplate(templateFullFileName string, tplVars interface{}) (string, error) {
	t, err := template.ParseFiles(templateFullFileName)
	if err != nil {
		return "", err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, tplVars); err != nil {
		return "", err
	}
	parsedTemplate := buf.String()
	return parsedTemplate, nil
}
