package models

import "encoding/json"

// TimeBlock defines a single block of time
// in a day between start and end. Should be stored in
// military time.
type TimeBlock struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

// DayTimeBlock defines a single day which has
// one or many time blocks.
type DayTimeBlock struct {
	Times []*TimeBlock `json:"times"`
}

// WeekTimeBlock defines a block of times over the course
// of the week in which each day has one or many blocks of time.
type WeekTimeBlock struct {
	Days []*DayTimeBlock `json:"days"`
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
	bytes, err := json.Marshal(dtb)
	return string(bytes), err
}

// ParseDayTimeBlock parses the given string into a TimeBlock.
func ParseDayTimeBlock(dtbString string) (*DayTimeBlock, error) {
	dtb := &DayTimeBlock{}
	return dtb, json.Unmarshal([]byte(dtbString), dtb)
}
