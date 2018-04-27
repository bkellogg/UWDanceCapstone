import React, { Component } from 'react';
import img from './imgs/defaultProfile.jpg';
import * as Util from './util.js';

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

  getPhoto = () => {
    fetch(Util.API_URL_BASE + "users/" + this.props.p.id +"/photo?auth=" + localStorage.auth)
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
    let p = this.props.p
    return (
        <tr>
          <td>
            <img src={this.state.photoUrl} alt="profile" className="avatar"/>
          </td>
          <td>
            {p.firstName + " " + p.lastName}
          </td>
          <td className="userRoleDisp">
            {p.role.displayName}
          </td>
          <td>
          {p.email}
          </td>
        </tr>
    )
};

}
export default PersonRow;