package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/BKellogg/UWDanceCapstone/servers/gateway/appvars"
)

// TimeBlock defines a single block of time
// in a day between start and end. Should be stored in
// military time.
type TimeBlock struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

// Validate validates tha the given TimeBlock represents
// a valid combination of start/end times. Returns an error
// if one occurred.
func (tb *TimeBlock) Validate() error {
	if len(tb.Start) != 4 {
		return errors.New("start time must be a 4 digit military time")
	}
	if len(tb.End) != 4 {
		return errors.New("end time must be a 4 digit military time")
	}
	start, err := strconv.Atoi(tb.Start)
	if err != nil {
		return errors.New("start time is not a valid time")
	}
	end, err := strconv.Atoi(tb.End)
	if err != nil {
		return errors.New("end time is not a valid time")
	}
	if start < 0 || end < 0 {
		return errors.New("start/end times cannot be before the day starts")
	}
	if start > 2400 || end > 2400 {
		return errors.New("start/end times cannot be after the day ends")
	}
	if start > end {
		return errors.New("start time cannot be after the end time")
	}
	if end-start < appvars.AvailMinBlockLength {
		return fmt.Errorf("available time blocks must be at least %s minutes", appvars.AvailMinBlockLength)
	}
	return nil
}

// DayTimeBlock defines a single day which has
// one or many time blocks.
type DayTimeBlock struct {
	Day   string       `json:"day,omitempty"`
	Times []*TimeBlock `json:"times,omitempty"`
}

// Validate validates the day time block is a valid day of the week
// with valid time blocks. Returns an error if one occurred.
func (dtb *DayTimeBlock) Validate() error {
	switch dtb.Day {
	case "sun", "mon", "tues", "wed", "thurs", "fri", "sat":
		break
	default:
		return errors.New("day must be a valid week day abbreviation")
	}
	if dtb.Times == nil {
		return errors.New("the list of times cannot be nil")
	}
	for _, tb := range dtb.Times {
		if err := tb.Validate(); err != nil {
			return err
		}
	}
	return nil
}

// WeekTimeBlock defines a block of times over the course
// of the week in which each day has one or many blocks of time.
type WeekTimeBlock struct {
	Days []*DayTimeBlock `json:"days,omitempty"`
}

// Validate validates that the week time block contains
// valid day time blocks. Returns an error if one occurred.
func (wtb *WeekTimeBlock) Validate() error {
	for _, dtb := range wtb.Days {
		if err := dtb.Validate(); err != nil {
			return err
		}
	}
	return nil
}

// ToSerializedDayMap returns a parsed map of the WeekTimeBlock where
// the keys are the days and the values are serialized arrays of times
// for those days.
func (wtb *WeekTimeBlock) ToSerializedDayMap() (map[string]string, error) {
	result := make(map[string]string)
	for _, day := range wtb.Days {
		key := strings.ToLower(day.Day)
		val := ""
		for i := 0; i < len(day.Times)-1; i++ {
			serial, err := day.Times[i].Serialize()
			if err != nil {
				return nil, errors.New("error serializing day time: " + err.Error())
			}
			val += serial + ", "
		}
		serial, err := day.Times[len(day.Times)-1].Serialize()
		if err != nil {
			return nil, errors.New("error serializing day time: " + err.Error())
		}
		val += serial
		result[key] = val
	}
	return result, nil
}

// Serialize serializes the current time block into
// a string where it is ready to be stored.
func (tb *TimeBlock) Serialize() (string, error) {
	bytes, err := json.Marshal(tb)
	return string(bytes), err
}

// ParseTimeBlock parses the given string into a TimeBlock.
func ParseTimeBlock(tbString string) (*TimeBlock, error) {
	tb := &TimeBlock{}
	return tb, json.Unmarshal([]byte(tbString), tb)
}

// Serialize serializes the current day time block into
// a string where it is ready to be stored.
func (dtb *DayTimeBlock) Serialize() (string, error) {
	dtb.Day = strings.ToLower(dtb.Day)
	bytes, err := json.Marshal(dtb)
	return string(bytes), err
}

// ParseDayTimeBlock parses the given string into a TimeBlock.
func ParseDayTimeBlock(dtbString string) (*DayTimeBlock, error) {
	dtb := &DayTimeBlock{}
	return dtb, json.Unmarshal([]byte(dtbString), dtb)
}
