import React, { Component } from 'react';
import * as Util from './util';
import Button from 'material-ui/RaisedButton';
import img from './imgs/defaultProfile.jpg';

class ConflictRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        photoUrl: img
    }
  };

  componentDidMount(){
      this.getPhoto
  }

  getPhoto = () => {
    fetch(Util.API_URL_BASE + "users/" + this.props.dancer.id +"/photo?auth=" + localStorage.auth)
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
    let choreographers = this.props.choreographers
    console.log(choreographers)
    let dancer = this.props.dancer
    console.log(dancer)
    return (
        <tr>
            <td>
                <img src={this.state.photoUrl} className="avatar"/>
            </td>
            <td>
                regNum
            </td>
            <td>
                {dancer.firstName + " " + dancer.lastName}
            </td>
            <td>
            </td>
            <td>
            </td>
            <td>
            </td>
            <td>
            </td>
        </tr>
  );
};

}
export default ConflictRow;

