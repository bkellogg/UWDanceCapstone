import React, { Component } from 'react';
import './styling/selectCast.css';

import Avatar from 'material-ui/Avatar';
import Checkbox from 'material-ui/Checkbox';

class CastingPersonRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        cast:[],
        rank: "",
        checked: {
            one: false,
            two: false,
            three: false
        }
    }
  };

  updateCheck = (event) => {
      let val = event.target.value
      if(val === "1"){
          this.setState({
              checked:{
                one: !this.state.checked.one,
                two: false,
                three: false
              }
          })
      } else if(val === "2"){
        this.setState({
            checked:{
              one: false,
              two: !this.state.checked.two,
              three: false
            }
        })
      } else if (val === "3"){
        this.setState({
            checked:{
              one: false,
              two: false,
              three: !this.state.checked.three
            }
        })
      }
  }

  render() {
      let p = this.props.person
    return (
      <tr>
        <td>
        <Avatar>:)</Avatar>
        </td>
        <td>
            regNum
        </td>
        <td>
          {p.firstName + " " + p.lastName}
        </td>
        <td>
          numPieces
        </td>
        <td>
        <div className="check">
            <Checkbox
                value="1"
                checked={this.state.checked.one}
                onCheck={this.updateCheck}
            />
        </div>
        <div className="check">
            <Checkbox 
                value="2"
                checked={this.state.checked.two}
                onCheck={this.updateCheck}
            />
        </div>
        <div className="check">
            <Checkbox
                value="3"
                checked={this.state.checked.three}
                onCheck={this.updateCheck}
            />
        </div>
        </td>
      </tr>
  );
};

}
export default CastingPersonRow;