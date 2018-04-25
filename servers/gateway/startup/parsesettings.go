package startup

import (
	"errors"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
	"github.com/go-ini/ini"
)

func ParseSettingsFromINI(path string) (*RunSettings, error) {
	if len(path) == 0 {
		path = appvars.DefaultAppINILocation
	}
	cfg, err := ini.Load(path)
	if err != nil {
		return nil, errors.New("error loading app.ini: " + err.Error())
	}
	settings := &RunSettings{}
	err = cfg.MapTo(settings)
	if err != nil {
		return nil, errors.New("error mapping ini file to RunSettings struct: " + err.Error())
	}
	return settings, nil
}
