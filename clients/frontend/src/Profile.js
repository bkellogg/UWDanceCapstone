import React, { Component } from 'react';
import * as Util from './util';
import img from './imgs/defaultProfile.jpg'
import './styling/Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.getPhoto = this.getPhoto.bind(this);
    this.state ={
      user: JSON.parse(localStorage.getItem("user")),
      auth: localStorage.getItem("auth"),
      photoError: null,
      photoSrc: img
    }
  };

  componentDidMount(){
    console.log(this.state.photoSrc)
    //this.getPhoto()
  }

  getPhoto(){
      fetch(Util.API_URL_BASE + "users/me/photo?auth=" + this.state.auth)
          .then((res) => {
              if (res.ok) {
                  return res.blob();
              }
              return res.text().then((t) => Promise.reject(t));
          })
          .then((data) => {
              this.setState({
                photoSrc : URL.createObjectURL(data)
              })
          })
          .catch((err) => {
              this.setState({
                photoError: err
              })
          });
  }

  render() {
    return (
      <section className="main">
        <div className="sub">
          <div className="header">
          <div id="photoContainer">
            <img src={this.state.photoSrc}></img>
          </div>
          <div id="name">
            <h1>{this.state.user.firstName} {this.state.user.lastName}</h1>
          </div>
          </div>
        </div>
      </section>
    );
  };
}

export default Profile;