import React, { Component } from 'react';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const times = ["1000", "1030","1100","1130","1200","1230","1300", "1330", "1400","1430", 
"1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100"]

const formattedTimes = ["10:00 AM", "10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM", "1:30 PM", "2:00 PM","2:30 PM", 
"3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "8:30 PM", "9:00 PM", "9:30 PM", "10:00 PM"]

class RehearsalRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        day : "mon"
    }
  };

  handleChange = (event, index, value) => this.setState({day: value});

  render() {
      let timePicker = []
      times.forEach((time, index) => {
        return (
            timePicker.push(
                <MenuItem value={time} primaryText={formattedTimes[index]} />
            ) 
        )
      })
    return (
      <section>
        <SelectField
          floatingLabelText="Day"
          value={this.state.day}
          onChange={this.handleChange}
          autoWidth={true}
        >
          <MenuItem value={"mon"} primaryText="Monday" />
          <MenuItem value={"tues"} primaryText="Tuesday" />
          <MenuItem value={"wed"} primaryText="Wednesday" />
          <MenuItem value={"thurs"} primaryText="Thursday" />
          <MenuItem value={"fri"} primaryText="Friday" />
          <MenuItem value={"sat"} primaryText="Saturday" />
          <MenuItem value={"sun"} primaryText="Sunday" />

        </SelectField>
        <SelectField
          floatingLabelText="Start Time"
          value={this.state.day}
          onChange={this.handleChange}
          autoWidth={true}
        >
          {timePicker}

        </SelectField>
        <SelectField
          floatingLabelText="End Time"
          value={this.state.day}
          onChange={this.handleChange}
          autoWidth={true}
        >
          {timePicker}

        </SelectField>
      </section>
  );
};

}
export default RehearsalRow;