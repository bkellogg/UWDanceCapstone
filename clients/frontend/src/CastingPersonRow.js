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
    //this.props.person.rank = "";
  };

  componentDidMount(){
      //let users = JSON.parse(localStorage.getItem("allUsers"))
      //loop through local storage to get the rank
      let person = this.state.person
      person.rank = ""
      this.setState({
          person : person
      })
  }

  updateCheck = (event) => {
    let cast = JSON.parse(localStorage.getItem("cast"))
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

    //handling the removal of a user from the cast
    //??doesn't work
    if (val === this.state.rank) {
        this.setState({
            rank: ""
        })
    } else {
        this.setState({
            rank: val
        })
    }
    
    let person = this.state.person
    person.rank = this.state.rank
    this.setState({
        person : person
    })


        //need to make it so it deletes it first if it exists
        cast.push(person)
        localStorage.setItem('cast', JSON.stringify(cast));


  }

  render() {
    let p = this.state.person
    console.log(JSON.parse(localStorage.getItem("cast")))
    console.log(this.state.rank)
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