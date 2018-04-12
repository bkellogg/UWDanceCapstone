import React, { Component } from 'react';
import * as Util from './util';
import { Button, Input, Row } from 'react-materialize';
import img from './imgs/defaultProfile.jpg'
import './styling/Profile.css';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.getPhoto = this.getPhoto.bind(this);
    this.onClick = this.onClick.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.resumeChange = this.resumeChange.bind(this);
    this.photoChange = this.photoChange.bind(this);
    this.formatHistory = this.formatHistory.bind(this);
    this.state = {
      user: JSON.parse(localStorage.getItem("user")),
      auth: localStorage.getItem("auth"),
      photoError: null,
      photoSrc: null,
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

  componentDidMount() {
    this.getPhoto();
    //this.getHistory();
    this.getResume();
    console.log(this.state.resume);

    //TODO deal with the fact that there are going to be pages
    Util.makeRequest("users/1/shows?history=all", {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
      })
      .then((res) => {
        this.setState({
          history: res.shows
        })

        this.formatHistory(res.shows)

      })
      .catch((err) => {
        console.log("whoops!")
      })
  }

  formatHistory(shows) {
    let showTypes = {};

    Util.makeRequest("shows/types?includeDeleted=true", {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
      })
      .then((data) => {
        data.map(function (show) {
          showTypes[show.id.toString()] = show.desc
        })
        return showTypes

      })
      .then(showTypes => {
        let showHistory = [];
        shows.forEach(function (p) {
          let typeID = p.typeID
          let showName = showTypes[typeID]
          let showYear = p.createdAt.substring(0, 4)
          let show = { "name": showName, "year": showYear }
          showHistory.push(show)
        })
        return showHistory
      })
      .then(showHistory => {
        this.setState({
          history: showHistory
        })
      })

  }

  //want to move this to util eventually
  getPhoto() {
    fetch(Util.API_URL_BASE + "users/me/photo?auth=" + this.state.auth)
      .then((res) => {
        if (res.ok) {
          return res.blob();
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        this.setState({
          photoSrc: URL.createObjectURL(data)
        })
      })
      .catch((err) => {
        this.setState({
          photoError: err
        })
      });
  }

  getResume() {
    fetch(Util.API_URL_BASE + "users/me/resume?auth=" + this.state.auth)
      .then((res) => {
        if (res.ok) {
          return res.blob();
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        this.setState({
          resume: URL.createObjectURL(data)
        })
      })
      .catch((err) => {
        this.setState({
          resumeErr: err
        })
      });
  }

  onClick() {
    if (this.state.edit) {
      if (this.state.firstName !== "") {
        Util.uploadFName(this.state.firstName);
        this.setState({ fname: this.state.firstName })
      }
      if (this.state.lastName !== "") {
        Util.uploadLName(this.state.lastName)
        this.setState({ lname: this.state.lastName })
      }
      if (this.state.photoUpload !== "") { //honestly not sure what kind of data we get if we upload a photo and then remove it
        Util.uploadPhoto(this.state.photoUpload)
        this.setState({ photoSrc: this.state.photoUpload })
      }
      if (this.state.bioUpload !== "") {
        Util.uploadBio(this.state.bioUpload) //refreshing the local user is built in aka don't need to call the bio back from the server
        this.setState({ bio: this.state.bioUpload })
      }
      if (this.state.resumeUpload !== "") {
        Util.uploadResume(this.state.resumeUpload) //doesn't work
        this.setState({ resume: this.state.resumeUpload })
      }
      this.setState({
        firstName: "",
        lastName: "",
        photoUpload: "",
        bioUpload: "",
        resumeUpload: ""
      })
    }
    let editState = !this.state.edit
    this.setState({
      edit: editState
    })
  }

  inputChange(val) {
    const name = val.target.name
    this.setState({
      [name]: val.target.value
    })
  }

  resumeChange(val) {
    this.setState({
      resumeUpload: val.target
    })
  }

  photoChange(val) {
    this.setState({
      photoUpload: val.target
    })
  }



  render() {
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
                  <Input id="photoUpload" name="photoUpload" type="file" onChange={this.photoChange} />
                </section>
              }
            </div>
            <div id="name">
              {!this.state.edit && <h1 id="profileName">{this.state.fname} {this.state.lname}</h1>}
              {this.state.edit &&
                <div id="editName">
                  <Row>
                    <Input id="firstName" name="firstName" s={6} label="First Name" onChange={this.inputChange} />
                    <Input id="lastname" name="lastName" s={6} label="Last Name" onChange={this.inputChange} />
                  </Row>
                </div>
              }
            </div>
          </div>
          <div id="bio">
            <div className="subheader"><b>Bio:</b></div>
            {!this.state.edit &&
              <section>
                {this.state.bio !== "" && this.state.bio}
                {this.state.bio === "" && " Dancer has no bio"}
              </section>
            }
            {this.state.edit &&
              <div id="editBio">
                <Input id="bioUpload" name="bioUpload" s={6} placeholder="Bios should be 60 words or less" onChange={this.inputChange} />
              </div>
            }
          </div>
          <div id="history">
            <div id="historyTitle" className="subheader"><b>Piece History:</b></div>
            {this.state.history !== null && this.state.history.map((p, i) => {
              return (
                //TODO STYLE THESE
                <div className="showHistory" key={i}>
                  <p>{p.name}</p>
                  <p>{p.year}</p>
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
                {this.state.resume === null && <p>Dancer has not uploaded a resume.</p>}
                <a href={this.state.resume} target="_blank">Resume</a>
              </section>
            }
            {this.state.edit &&
              <section>
                <div> Upload your dance resume as a PDF. </div>
                <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.inputChange} />
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