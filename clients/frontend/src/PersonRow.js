import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import img from './imgs/defaultProfile.jpg';
import Button from 'react-materialize/lib/Button';

import * as Util from './util.js';
import './styling/General.css';

class PersonRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        photoUrl: img
    }
  };

  componentDidMount(){
    this.getPhoto()
  }

  dropFromCast = () => {
    Util.makeRequest("users/" + this.props.p.id + "/pieces/" + this.props.pieceID, {}, "UNLINK", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(res => {
      this.props.updateCast()
    })
  }

  getPhoto = () => {
    Util.makeRequest("users/" + this.props.p.id + "/photo", {}, "GET", true)
    .then((res) => {
      if (res.ok) {
        return res.blob();
      }
      if (res.status === 401) {
        Util.signOut()
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
    let p = this.props.p
    return (
        <tr>
          { !this.props.setRehearsals &&
            <td className="avatarWrap">
              <img src={this.state.photoUrl} alt="profile" className="avatar"/>
            </td>
          }
          <td>
            <Link className="personNameLink" to={{pathname: "/users/" + this.props.p.id}} target="_blank">{p.firstName + " " + p.lastName}</Link>
          </td>
          {
            !this.props.piece && !this.props.setRehearsals &&
            <td className="userRoleDisp">
              {p.role.displayName}
            </td>
          }
          {
            this.props.piece &&
            <td className="userBioDisp">
              {p.bio}
            </td>
          }
          <td>
          {p.email}
          </td>
          {
            this.props.piece &&
            <td className="dropDancer">
              <Button 
                backgroundcolor="#708090"
                style={{color: '#ffffff', float: 'right'}}
                onClick={() => this.dropFromCast()}> 
                DROP </Button>
            </td>
          }
        </tr>
    )
};

}
export default PersonRow;