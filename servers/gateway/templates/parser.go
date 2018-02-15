package templates

import (
	"bytes"
	"html/template"
)

func ParseTemplate(templateFullFileName string, values interface{}) (string, error) {
	t, err := template.ParseFiles(templateFullFileName)
	if err != nil {
		return "", err
	}
	buf := new(bytes.Buffer)
	if err = t.Execute(buf, values); err != nil {
		return "", err
	}
	parsedTemplate := buf.String()
	return parsedTemplate, nil
}
