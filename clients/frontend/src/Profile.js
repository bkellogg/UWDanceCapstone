import React, { Component } from 'react';
import * as Util from './util';
import {Button, Input, Row} from 'react-materialize';
import img from './imgs/defaultProfile.jpg'
import './styling/Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.getPhoto = this.getPhoto.bind(this);
    this.getHistory = this.getHistory.bind(this);
    this.getResume = this.getResume.bind(this);
    this.onClick = this.onClick.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.state ={
      user: JSON.parse(localStorage.getItem("user")),
      auth: localStorage.getItem("auth"),
      photoError: null,
      photoSrc: img,
      bio: JSON.parse(localStorage.getItem("user")).bio,
      history: null,
      resume: null,
      resumeErr: null,
      fname: JSON.parse(localStorage.getItem("user")).firstName,
      lname: JSON.parse(localStorage.getItem("user")).lastName,
      edit: false,
      //the following are used to update the profile
      firstName: "",
      lastName: "",
      photoUpload: "",
      bioUpload: "",
      resumeUpload: ""
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
    if(this.state.edit){
      //is edit is true when we click this button, we are going to submit the input values
      //flow: if the input has a value in it -> post value to server -> then get back from the server -> set state -> empty out input values
      //We don't have a way to do first or last names atm
      if(this.state.firstName !== ""){

      }
      if(this.state.lastName !== ""){

      }
      if(this.state.uploadPhoto !== "") { //honestly not sure what kind of data we get if we upload a photo and then remove it
        console.log("you're going to have to ask brendan about that one")
      }
      if(this.state.uploadBio !== ""){
        Util.uploadBio(this.state.bioUpload) //refreshing the local user is built in aka don't need to call the bio back from the server
      }
      if(this.state.uploadResume !== ""){ //same with resumes (ask b)

      }
      this.setState({
        bio: this.state.bioUpload,
        fname: this.state.firstName,
        lname: this.state.lastName,
        firstname : "",
        lastName: "",
        uploadPhoto: "",
        uploadBio: "",
        uploadResume: ""
      })
    }
    let editState = !this.state.edit
    this.setState({
      edit: editState,
    })
    //this.getPhoto();
    //this.getResume();
  }

  inputChange(val){
    const name = val.target.name
    this.setState({
      [name] : val.target.value
    })
  }

  render() {
    console.log(this.state.user)
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
                  <Input id="photoUpload" name="photoUpload" type="file" onChange={this.inputChange}/>
                </section>
              }
            </div>
            <div id="name">
              {!this.state.edit && <h1 id="profileName">{this.state.fname} {this.state.lname}</h1>}
              {this.state.edit &&
                <div id="editName">
                  <Row>
                  <Input id="firstName" name="firstName" s={6} label="First Name" onChange={this.inputChange}/>
                  <Input id="lastname" name="lastName" s={6} label="Last Name" onChange={this.inputChange}/>
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
                <Input id="bioUpload" name="bioUpload" s={6} placeholder="Bios should be 60 words or less" onChange={this.inputChange}/>
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
                <Input id="resumeUpload" name="resumeUpload" type="file"/>
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