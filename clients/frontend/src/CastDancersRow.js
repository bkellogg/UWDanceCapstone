import React, { Component } from 'react';
import * as Util from './util.js';

import Checkbox from 'material-ui/Checkbox';
import Button from 'material-ui/RaisedButton';
import img from './imgs/defaultProfile.jpg';

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

    let removeBody = {
        "action":"remove",
        "drops":[
            this.props.person.id
        ]
    }
    let audition = "1"
    Util.makeRequest("auditions/" + audition + "/casting", removeBody, "PATCH", true)
    .then( res => {
      if(res.ok){
        return res.text()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(
        this.props.updateCast
    )

  }

  addToCast = () => {
    let castBody = {
        "action" : "add",
        "rank1" : [this.props.person.id],
        "rank2" : [],
        "rank3" : []
    }
    let audition = "1"
    Util.makeRequest("auditions/" + audition + "/casting", castBody, "PATCH", true)
    .then( res => {
      if(res.ok){
        return res.text()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(
        this.props.updateCast
    )
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
                <img src={this.state.photoUrl} alt="profile" className="avatar"/>
            </td>
            <td className="dancerAssignedNumber">
                regNum
            </td>
            <td>
                {person.firstName + " " + person.lastName}
            </td>
            {this.props.filter && //TODO make it so it only shows this if they have a comment
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
                    onClick={this.addToCast}> 
                    ADD </Button>
                </td>
            }
        </tr>
  );
};

}
export default CastDancersRow;