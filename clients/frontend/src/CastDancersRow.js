import React, { Component } from 'react';
import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/RaisedButton';
import Avatar from 'material-ui/Avatar';

class CastDancersRow extends Component {
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

  dropFromCast = () => {
    //this handles dropping them from the cast, but we also need to go through and update their rank in the allUsers
    let cast = JSON.parse((localStorage).getItem("cast"))
    let person = this.props.person

    //update cast
    cast = cast.filter(castMember => castMember.id !== person.id)
    localStorage.setItem("cast", JSON.stringify(cast))
    this.props.updateCast()

    //update all users
    let allUsers = JSON.parse(localStorage.getItem("allUsers"))
    allUsers.forEach(user => {
        if (user.id === person.id) {
            user.rank = ""
            return
        }
    })
    localStorage.setItem("allUsers", JSON.stringify(allUsers))
  }

  render() {
    let person = this.props.person
    return (
        <tr>
            {this.props.filter &&
                <td>
                    <Checkbox
                        onCheck = {this.onCheck}
                        checked = {this.state.checked}
                    />
                </td>
            }
            <td>
                <Avatar>:D</Avatar>
            </td>
            <td>
                regNum
            </td>
            <td>
                {person.firstName + " " + person.lastName}
            </td>
            {this.props.filter &&
                <td>
                    !
                </td>
            }
            {!this.props.filter &&
                <td>
                    <Button onClick={this.dropFromCast}> Drop </Button>
                </td>
            }
        </tr>
  );
};

}
export default CastDancersRow;