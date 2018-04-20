package models

import (
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

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
	if len(dtb.Times) > appvars.MaxAvailabiityTimeSlots {
		return errors.New("the number of time blocks exceeds the limit")
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
	Days      []*DayTimeBlock `json:"days,omitempty"`
	CreatedAt time.Time       `json:"createdAt,omitempty"`
	IsDeleted bool            `json:"isDeleted,omitempty"`
}

// RawAvailability represents how the availability is
// stored in an unparsed format inside the database.
type RawAvailability struct {
	ID        int
	Sunday    string
	Monday    string
	Tuesday   string
	Wednesday string
	Thursday  string
	Friday    string
	Saturday  string
	CreatedAt time.Time
	IsDeleted bool
}

// toWeekTimeBlock turns the current RawAvailability into a WeekTimeBlock
// nd returns it. Returns an error if one occurred.
func (ra *RawAvailability) toWeekTimeBlock() (*WeekTimeBlock, error) {
	wtbr := &WeekTimeBlock{}
	wtbr.IsDeleted = ra.IsDeleted
	wtbr.CreatedAt = ra.CreatedAt
	for i, day := range []string{ra.Sunday, ra.Monday, ra.Tuesday, ra.Wednesday, ra.Thursday, ra.Friday, ra.Saturday} {
		dayBlock := &DayTimeBlock{}
		dayBlock.Day = time.Weekday(i).String()
		for _, timeBlock := range strings.Split(day, ", ") {
			tb, err := ParseTimeBlock(timeBlock)
			if err != nil {
				return nil, err
			}
			if tb != nil {
				dayBlock.Times = append(dayBlock.Times, tb)
			}
		}
		if len(dayBlock.Times) > 0 {
			wtbr.Days = append(wtbr.Days, dayBlock)
		}
	}
	return wtbr, nil
}

// Validate validates that the week time block contains
// valid day time blocks. Returns an error if one occurred.
func (wtb *WeekTimeBlock) Validate() error {
	if len(wtb.Days) > 7 {
		return errors.New("week time block cannot contain more than 7 days")
	}
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
		if len(day.Times) == 0 {
			result[key] = "{}"
			continue
		}
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

	// For any day not supplied, add empty JSON braces to it so
	// empty days are properly handled by the JSON encoder.
	for _, day := range []string{"sun", "mon", "tues", "wed", "thurs", "fri", "sat"} {
		if len(result[day]) == 0 {
			result[day] = "{}"
		}
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
	if tbString == "{}" {
		return nil, nil
	}
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
