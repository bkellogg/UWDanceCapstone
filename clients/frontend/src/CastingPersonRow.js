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
        },
        person: this.props.person
    }
  };

  componentDidMount(){
    let rank = this.props.rank
    if (rank === "1") {
        this.setState({
            checked:{
                one: true,
                two: false,
                three: false
            }
        })
    } else if (rank === "2") {
        this.setState({
            checked:{
                one: false,
                two: true,
                three: false
            }
        })
    } else if (rank === "3") {
        this.setState({
            checked:{
                one: false,
                two: false,
                three: true
            }
        })
    } else if (rank === "") {
        this.setState({
            checked:{
                one: false,
                two: false,
                three: false
            }
        })
    }
    
  }

  updateCheck = (event) => {
    let val = event.target.value

    //handling only allowing one to be checked at a time
    if (val === "1") {
        this.setState({
            checked:{
                one: !this.state.checked.one,
                two: false,
                three: false
            }
        })
    } else if (val === "2") {
        this.setState({
            checked:{
                one: false,
                two: !this.state.checked.two,
                three: false
            }
        })
    } else if (val === "3") {
        this.setState({
            checked:{
                one: false,
                two: false,
                three: !this.state.checked.three
            }
        })
    }

    //handling the removal of a user from the cast by setting their rank to "" if they are removed
    let person = this.state.person
    if (val === person.rank) {
        person.rank = ""
    } else {
        person.rank = val
    }

    //update the rank of the user in the allUsers
    let allUsers = JSON.parse(localStorage.getItem("allUsers"))
    allUsers.forEach(user => {
        if (user.id === person.id) {
            user.rank = person.rank;
            //break;
        }
    })
    localStorage.setItem("allUsers", JSON.stringify(allUsers))

    //update the selected cast
    let cast = JSON.parse((localStorage).getItem("cast"))

    //remove from cast ALWAYS, add them back with their new rank if they have one
    cast = cast.filter(castMember => castMember.id !== person.id)

    if(person.rank !== ""){
        cast.push(person)
    }

    localStorage.setItem("cast", JSON.stringify(cast))

    this.setState({
        person : person
    })
  }

  render() {
    let p = this.state.person
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