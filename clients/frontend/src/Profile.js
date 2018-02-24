import React, { Component } from 'react';
import * as Util from './util';
import {Button, Input, Row} from 'react-materialize';
import img from './imgs/defaultProfile.jpg'
import './styling/Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.getPhoto = this.getPhoto.bind(this);
    this.getBio = this.getBio.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getResume = this.getResume.bind(this);
    this.onClick = this.onClick.bind(this);
    this.state ={
      user: JSON.parse(localStorage.getItem("user")),
      auth: localStorage.getItem("auth"),
      photoError: null,
      photoSrc: img,
      bio: JSON.parse(localStorage.getItem("user")).bio,
      history: null,
      resume: null,
      resumeErr: null,
      edit: false
    }
  };

  componentDidMount(){
    this.getPhoto();
    this.getHistory();
    this.getResume();
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

  getBio(){
    
  }

  getHistory(){
    //dummy data - this needs to be fleshed out
    let pieces = [
      {
        show: "Faculty Dance Concert",
        year: 2018,
        choreographer: "Bruce McCormick"
      },{
        show: "Faculty Dance Concert",
        year: 2017,
        choreographer: "Rachael Lincoln"
      },{
        show: "MFA Dance Concert",
        year:2016,
        choreographer: "Kyle Craig-Bogard"
      }]
    
      this.setState({
        history: pieces
      })
  }

  getResume(){
    let id = this.state.user.id;
    let auth = this.state.auth;
    fetch(Util.API_URL_BASE + "users/" + id + "/resume?auth=" + auth)
          .then((res) => {
              if (res.ok) {
                  return res.blob();
              }
              return res.text().then((t) => Promise.reject(t));
          })
          .then((data) => {
              this.setState({
                resume : data
              })
          })
          .catch((err) => {
              this.setState({
                resumeErr: err
              })
          });
  }

  onClick(){
    let editState = !this.state.edit
    this.setState({
      edit: editState
    })
    this.getPhoto();
    this.getResume();
  }

  render() {
    console.log(this.state.edit)
    return (
      <section className="main">
        <div className="sub">
          <div className="header">
            <div id="photoContainer">
              {!this.state.edit &&
                <img id="photo" src={this.state.photoSrc}></img>
              }
              {this.state.edit &&
                <section>
                  <div> Upload a head shot as a jpg file. </div>
                  <Input type="file"/>
                </section>
              }
            </div>
            <div id="name">
              {!this.state.edit && <h1 id="profileName">{this.state.user.firstName} {this.state.user.lastName}</h1>}
              {this.state.edit &&
                <div id="editName">
                  <Row>
                  <Input id="firstName" s={6} label="First Name" />
                  <Input id="lastname" s={6} label="Last Name" />
                  </Row>
                </div>
              }
            </div>
          </div>
          <div id="bio">
            <div className="subheader"><b>Bio:</b></div>
            {!this.state.edit && 
              <section>
                {this.state.bio.length > 0 && this.state.bio} 
                {this.state.bio.length === 0 && "  No bio available"}
              </section>
            }
            {this.state.edit &&
              <div id="editBio">
                <Input s={6} placeholder="Bios should be 60 words or less"/>
              </div>
            }
          </div>
          <div id="history">
            <div id="historyTitle" className="subheader"><b>Piece History:</b></div>
            {this.state.history !== null && this.state.history.map((p, i) => {
              return(
                <div className="showHistory" key={i}>
                  <div>
                    <b>Show: </b> {p.show}
                  </div>
                  <div>
                    <b>Year: </b> {p.year}
                  </div>
                  <div>
                    <b>Choreographer: </b> {p.choreographer}
                  </div>
                </div>
              )
            })}
            {this.state.history === null &&
            <p> Dancer has no piece history </p>
            }
          </div>
          <div id="resume">
            <div className="subheader"><b>Resume: </b></div>
            {!this.state.edit && 
              <section>
                {this.state.resume !== null && <p>This is where the resume will go!</p>}
                {this.state.resume === null && <p>Dancer has not uploaded a resume.</p>}
              </section>
            }
            {this.state.edit &&
              <section>
                <div> Upload your dance resume as a PDF. </div>
                <Input type="file"/>
              </section> 
            }
            </div>
          {!this.state.edit &&
            <Button id="edit" onClick={() => this.onClick()}>Edit profile</Button>
          }
          {this.state.edit &&
            <Button id="edit" onClick={() => this.onClick()}>Save changes</Button>
          }
        </div>
      </section>
    );
  };
}

export default Profile;