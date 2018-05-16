import React, { Component } from 'react';
import * as Util from './util';
import { Button, Input, Row } from 'react-materialize';
import img from './imgs/defaultProfile.jpg';
import AvatarEditorConsole from './AvatarEditorConsole';
import './styling/Profile.css';
import './styling/General.css';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: JSON.parse(localStorage.getItem("user")),
      auth: localStorage.getItem("auth"),
      photoSrc: img,
      bio: JSON.parse(localStorage.getItem("user")).bio,
      history: [],
      resume: null,
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

    //TODO deal with the fact that there are going to be pages
    Util.makeRequest("users/" + this.state.user.id + "/shows?history=all", {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((res) => {
        this.setState({
          history: res.shows
        })
        this.formatHistory(res.shows)
      })
      .catch((err) => {
        console.error(err);
        Util.handleError(err)
      })
  }

  formatHistory = (shows) => {
    let showTypes = {};
    Util.makeRequest("shows/types?includeDeleted=true", {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        data.map(function (show) {
          return showTypes[show.id.toString()] = show.desc
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
      .catch(err => {
        console.error(err)
        Util.handleError(err)
      })
  }

  getPhoto = () => {
    Util.makeRequest("users/me/photo", {}, "GET", true)
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
        this.setState({
          photoSrc: URL.createObjectURL(data)
        })
      })
      .catch((err) => {
        console.error(err)
        Util.handleError(err)
      });
  }

  getResume = () => {
    Util.makeRequest("users/me/resume", {}, "GET", true)
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
        this.setState({
          resume: URL.createObjectURL(data)
        })
      })
      .catch((err) => {
        console.error(err)
        Util.handleError(err)
      });
  }

  uploadPhoto = (img) => {
    let data = new FormData();
    data.append("image", img);
    let xhr = new XMLHttpRequest();
    xhr.addEventListener("readystatechange", () => {
      this.getPhoto()
    });
    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status < 400) {
          return xhr.responseText
        }
      }
    };

    xhr.open("POST", Util.API_URL_BASE + "users/me/photo");
    xhr.setRequestHeader("Authorization", Util.getAuth());
    xhr.setRequestHeader("ImageFieldName", "image");

    xhr.send(data);
  }

  onClick = () => {
    if (this.state.edit) {
      if (this.state.firstName !== "") {
        Util.uploadFName(this.state.firstName);
        this.setState({ fname: this.state.firstName })
      }
      if (this.state.lastName !== "") {
        Util.uploadLName(this.state.lastName)
        this.setState({ lname: this.state.lastName })
      }
      if (this.state.photoUpload !== "") {
        this.uploadPhoto(this.state.photoUpload)
      }
      if (this.state.bioUpload !== "") {
        Util.uploadBio(this.state.bioUpload)
        this.setState({ bio: this.state.bioUpload })
      }
      if (this.state.resumeUpload !== "") {
        Util.uploadResume(this.state.resumeUpload)
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

  inputChange = (val) => {
    const name = val.target.name
    this.setState({
      [name]: val.target.value
    })
  }

  resumeChange = (val) => {
    this.setState({
      resumeUpload: val.target
    })
  }

  onKeyDown = event => {
    let len = event.target.value.split(/[\s]+/);
    this.setState({
      bioUpload: event.target.value,
      wordCount: len.length,
    });
    if (len.length > 60) {
      if (event.keyCode === 46 || event.keyCode === 8 || (event.keyCode >= 37 && event.keyCode <= 40)) {

      } else if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
      }
    }
  }

  updateImage = (img) => {
    this.setState({
      photoUpload: img
    })
  }

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1 className="pagetitle">Your Profile </h1>

            <div className="fullWidthCard">
              {/* FIRST CARD */}
              <div className="wrap">
                <div className="header">

                  <div id="photoContainer" className="photoContainer">
                    {!this.state.edit &&
                      <img id="photo" alt="profile" src={this.state.photoSrc}></img>
                    }
                    {this.state.edit &&
                      <section>
                        <div>
                          <p>Upload a head shot as a jpg file. </p>
                        </div>
                        <AvatarEditorConsole img={this.state.photoSrc} changeImg={this.updateImage} />
                      </section>
                    }
                  </div>


                  <div className="nameAndBioWrap">
                    <div id="name" className="name">

                      {!this.state.edit && <h1 id="profileName">{this.state.fname} {this.state.lname}</h1>}
                      {this.state.edit &&
                        <div id="editName">
                          <Row>
                            <Input id="firstName" name="firstName" s={6} label="First Name" onChange={this.inputChange} defaultValue={this.state.fname}/>
                            <Input id="lastname" name="lastName" s={6} label="Last Name" onChange={this.inputChange} defaultValue={this.state.lname}/>
                          </Row>
                        </div>
                      }
                    </div>

                    <div id="bio" className="bio">
                      <div className="subheader"><b>Dancer Bio:</b></div>
                      {!this.state.edit &&
                        <section>
                          {this.state.bio !== "" && this.state.bio}
                          {this.state.bio === "" && " Dancer has no bio"}
                        </section>
                      }
                      {this.state.edit &&
                        <div id="editBio">
                          <div className="row">
                            <form className="col s12">
                              <div className="row">
                                <div className="input-field col s12">
                                  <textarea id="textarea1" name="bioUpload" s={6} className="materialize-textarea" onChange={this.inputChange} defaultValue={this.state.bio}></textarea>
                                  <label htmlFor="textarea1">Bios should be 60 words or less</label>
                                </div>
                              </div>
                            </form>
                          </div>
                        </div>

                      }

                    </div>

                  </div>
                  {!this.state.edit &&
                    <Button id="edit" className="editButton" onClick={() => this.onClick()}>Edit</Button>

                  }
                  
                </div>
              </div>
              <div className="mainContentBorder">
                <div id="history">
                  <div id="historyTitle" className="subheader"><b>Your Piece History</b></div>
                  {this.state.history.length > 0 && this.state.history.map((p, i) => {
                    return (
                      //TODO STYLE THESE
                      <div className="showHistory" key={i}>
                        <p>{p.name}</p>
                        <p>{p.year}</p>
                      </div>
                    )
                  })}
                  {this.state.history.length === 0 &&
                    <p> Dancer has no piece history </p>
                  }
                </div>

                <div id="resume">
                  {!this.state.edit &&
                    <section>
                      {this.state.resume === null && <p>Dancer has not uploaded a resume.</p>}
                      {this.state.resume != null && (
                        <div>
                          <a href={Util.API_URL_BASE + "users/me/resume?auth=" + this.state.auth} target="_blank">View PDF Resume</a>
                        </div>
                      )}

                    </section>
                  }
                  {this.state.edit &&
                    <section>
                      <div> Upload your dance resume <b>AS A PDF.</b> </div>
                      <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange}/>
                    </section>
                  }
                </div>
                
              </div>
              
            </div>
{this.state.edit &&
  <Button id="edit" className="saveButton" onClick={() => this.onClick()}>Save</Button>
}
          </div>
        </div>
      </section>
    );
  };
}

export default Profile;