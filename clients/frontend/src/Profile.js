import React, { Component } from 'react';
import * as Util from './util';
import { Button, Input, Row } from 'react-materialize';
import img from './imgs/defaultProfile.jpg';
import AvatarEditorConsole from './AvatarEditorConsole';
import TextField from 'material-ui/TextField';
import { compose } from 'ramda';
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
      resumeUpload: "",
      wordCount: "",
      text: ""
    }
  };

  componentDidMount() {
    this.getPhoto();
    //this.getHistory();
    this.getResume();
    this.setCounts(this.state.bio);

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
      if (this.state.bioUpload !== this.state.bio) {
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

  onCancel = () => {
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

  updateImage = (img) => {
    this.setState({
      photoUpload: img
    })
  }

  // Set Bio word count 
  setCounts = value => {
    const trimmedValue = value.trim();
    const words = compose(this.removeEmptyElements, this.removeBreaks)(trimmedValue.split(' '));

    this.setState({
      text: value,
      bioUpload: value,
      wordCount: value === '' ? 0 : words.length,
    });
  }

  removeBreaks = arr => {
    const index = arr.findIndex(el => el.match(/\r?\n|\r/g));

    if (index === -1)
      return arr;

    const newArray = [
      ...arr.slice(0, index),
      ...arr[index].split(/\r?\n|\r/),
      ...arr.slice(index + 1, arr.length)
    ];

    return this.removeBreaks(newArray);
  }

  removeEmptyElements = arr => {
    const index = arr.findIndex(el => el.trim() === '');

    if (index === -1)
      return arr;

    arr.splice(index, 1);

    return this.removeEmptyElements(arr)
  };

  handleBioChange = e => this.setCounts(e.target.value);

  render() {
    let email = this.state.user.email
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
                        <AvatarEditorConsole style={{marginBottom: "15px"}} img={this.state.photoSrc} changeImg={this.updateImage} />
                      </section>
                    }
                  </div>


                  <div className="nameWrap">
                    <div id="name" className="name">

                      {
                        !this.state.edit && 
                        <div>
                          <h1 id="profileName">{this.state.fname} {this.state.lname}</h1>
                          <p className="email"><a href={"mailto:" + this.state.user.email}>{email}</a></p>
                        </div>
                      }
                      {this.state.edit &&
                        <div id="editName">
                          <b>Name: </b>
                          <Row>
                            <Input id="firstName" name="firstName" s={6} label="First Name" onChange={this.inputChange} defaultValue={this.state.fname} style={{backgroundColor: 'white', border: '1px solid lightgray', borderRadius: '5px', paddingLeft: '10px'}}/>
                            <Input id="lastname" name="lastName" s={6} label="Last Name" onChange={this.inputChange} defaultValue={this.state.lname} style={{backgroundColor: 'white', border: '1px solid lightgray', borderRadius: '5px', paddingLeft: '10px'}} />
                          </Row>
                        </div>
                      }
                    </div>
                  </div>
                  {
                    !this.state.edit &&
                    <Button id="edit" className="editButton" onClick={() => this.onClick()}>Edit</Button>
                  }

                </div>
              </div>
              <div className="mainContentBorder">
                <div id="bio" className="bio">
                  <div className="subheader"><b>Bio:</b></div>
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
                              <TextField
                                className="bioUpload2"
                                defaultValue={this.state.text}
                                multiLine={true}
                                onChange={this.handleBioChange}
                                style={{backgroundColor: 'white', height: '100px', maxWidth: '400px', width: '100%', border: '1px solid lightgray', borderRadius: '5px', paddingLeft: '10px'}}
                              />
                              <p style={{fontSize: "13px"}}><strong>Word Count:</strong> {this.state.wordCount}</p>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  }
                </div>

                <div className="resumeWrap">
                    <div id="resume">
                      {!this.state.edit &&
                        <section>
                          {this.state.resume === null && <p>Dancer has not uploaded a resume.</p>}
                          {this.state.resume != null && (
                            <div>
                              <div className="subheader"><b>Resume:</b></div>
                              <a href={this.state.resume}>View PDF Resume</a>
                            </div>
                          )}

                        </section>
                      }
                      {this.state.edit &&
                        <section>
                          <div className="subHeader"><b>Resume:  </b></div>
                          <div> Upload your dance resume <b>AS A PDF.</b> </div>
                          <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange} />
                        </section>
                      }
                    </div>
                  </div>

                { !this.state.edit &&
                  <div id="history">
                    <div id="historyTitle" className="subheader"><b>Piece History</b></div>
                    {this.state.history.length > 0 && this.state.history.map((p, i) => {
                      return (
                        //TODO STYLE THESE
                        <div className="showHistory" key={i}>
                          <p>{p.name + ", " + p.year}</p>
                        </div>
                      )
                    })}
                    {this.state.history.length === 0 &&
                      <p> Dancer has no piece history. <i>We will auto-fill piece history once you start participating in shows.</i></p>

                    }
                  </div>
                  }

              </div>

            </div>
            {this.state.edit &&
              <div className="editButtons"> 
                <Button id="edit" className="saveButton" onClick={() => this.onClick()}>Save</Button>
                <Button className="btn cancelButton" onClick={() => this.onCancel()}>Cancel</Button>
              </div>
            }
          </div>
          <Button> Delete Account </Button>
        </div>
      </section>
    );
  };
}

export default Profile;