import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import Avatar from 'material-ui/Avatar';

class AvailabilityPersonRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked : false
    }
  };

  onCheck = () => {
      this.setState({
          checked : !this.state.checked
      })
  }

  render() {
    let person = this.props.person
    return (
        <tr>
            <td>
                <Checkbox
                    onCheck = {this.onCheck}
                    checked = {this.state.checked}
                />
            </td>
            <td>
                <Avatar>:D</Avatar>
            </td>
            <td>
                regNum
            </td>
            <td>
                {person.firstName + " " + person.lastName}
            </td>
            <td>
                !
            </td>
        </tr>
  );
};

}
export default AvailabilityPersonRow;