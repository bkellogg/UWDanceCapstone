import React, { Component } from 'react';
import TimePicker from 'material-ui/TimePicker';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

class RehearsalRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        day : "mon"
    }
  };

  handleChange = (event, index, value) => this.setState({day: value});

  render() {
    return (
      <section>
        <SelectField
          floatingLabelText="Day"
          value={this.state.day}
          onChange={this.handleChange}
        >
          <MenuItem value={"mon"} primaryText="Monday" />
          <MenuItem value={"tues"} primaryText="Tuesday" />
          <MenuItem value={"wed"} primaryText="Wednesday" />
          <MenuItem value={"thurs"} primaryText="Thursday" />
          <MenuItem value={"fri"} primaryText="Friday" />
          <MenuItem value={"sat"} primaryText="Saturday" />
          <MenuItem value={"sun"} primaryText="Sunday" />

        </SelectField>
        <TimePicker
            hintText="Start Time"
        />
        <TimePicker
            hintText="End Time"
        />
      </section>
  );
};

}
export default RehearsalRow;