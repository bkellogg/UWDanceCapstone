import React, { Component } from 'react';
import './styling/selectCast.css';

import Button from 'material-ui/RaisedButton'
import Avatar from 'material-ui/Avatar';
import Checkbox from 'material-ui/Checkbox';

class AllDancersRow extends Component {
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
            return
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

  addToCast = () => {

    //this handles adding them to the cast, but we also need to update their rank in the allUsers (I'm gonna go with a 1?)
    let cast = JSON.parse((localStorage).getItem("cast"))
    let person = this.state.person

    cast = cast.filter(castMember => castMember.id !== person.id)
    cast.push(person)
    localStorage.setItem("cast", JSON.stringify(cast))
    
    //update all users
    let allUsers = JSON.parse(localStorage.getItem("allUsers"))
    allUsers.forEach(user => {
        if (user.id === person.id) {
            user.rank = "1"
            return
        }
    })
    localStorage.setItem("allUsers", JSON.stringify(allUsers))

    //done to rerender the component
    //doesn't work
    this.props.updateCast()
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
        {this.props.selectCast &&
            <td>
            numPieces
            </td>
        }
        <td>
            {this.props.selectCast && 
                <section>
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
                </section>
            }
            {!this.props.selectCast &&
                <Button onClick={this.addToCast}> Add </Button>
            }
        </td>
      </tr>
  );
};

}
export default AllDancersRow;