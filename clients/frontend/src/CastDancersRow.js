import React, { Component } from 'react';
import * as Util from './util.js';

import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/RaisedButton';
import img from './imgs/defaultProfile.jpg';
import Avatar from 'material-ui/Avatar';

class CastDancersRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checked : false,
      photoUrl : img
    }
  };

  componentDidMount(){
      this.getPhoto()
  }

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

  getPhoto = () => {
    fetch(Util.API_URL_BASE + "users/" + this.props.person.id +"/photo?auth=" + localStorage.auth)
    .then((res) => {
      if (res.ok) {
        return res.blob();
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        return(URL.createObjectURL(data))
    })
    .then(url => {
        this.setState({
            photoUrl : url
        })
    }).catch((err) => {
      Util.handleError(err)
    });
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
                <img src={this.state.photoUrl} className="avatar"/>
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
            {!this.props.filter && !this.props.uncast &&
                <td>
                    <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={this.dropFromCast}> 
                    DROP </Button>
                </td>
            }
            {!this.props.filter && this.props.uncast &&
                <td>
                    <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={this.dropFromCast}> 
                    ADD </Button>
                </td>
            }
        </tr>
  );
};

}
export default CastDancersRow;