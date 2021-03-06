import React, { Component } from 'react';
import * as Util from './util';
import { Button, Input, Row } from 'react-materialize';
import img from './imgs/defaultProfile.jpg';
import AvatarEditorConsole from './AvatarEditorConsole';
import TextField from 'material-ui/TextField';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
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
      text: "EX: I am majoring in Informatics and have danced in several local companies.",
      deleteConfirmation: false
    }
  };

  componentDidMount() {
    this.getPhoto();
    //this.getHistory();
    this.getResume();
    this.setCounts(this.state.bio);

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

  deleteAccount = () => {
    Util.makeRequest("users/me", {}, "LOCK", true)
    .then(res => {
      this.setState({
        deleteConfirmation: false,
        deleteSuccess: true
      })
      setTimeout(() => {Util.signOut()}, 1500)
    })
  }

  render() {
    let email = this.state.user.email
    let defaultBio = this.state.text
    let hintText = false
    if  (this.state.text.length === 0) { //if there is no bio
      hintText = "EX: I am majoring in Informatics and have danced with Relay Dance Collective, Chamber Dance Company, and New Vision Dance Co."
      defaultBio = ""
    }
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1 className="pagetitle">Your Profile </h1>

            <div className="fullWidthCard">
              {/* FIRST CARD */}
              <div className="wrap">
                <div className="header">

                  <div id="photoContainer" className="photoContainer anotherOne">
                    {
                      !this.state.edit &&
                      <img id="photo" alt="profile" src={this.state.photoSrc}></img>
                    }
                    {this.state.edit &&
                      <section>
                        <AvatarEditorConsole style={{marginBottom: "15px"}} img={this.state.photoSrc} changeImg={this.updateImage} />
                      </section>
                    }
                  </div>


                  <div className="nameWrap extraNameWrap">
                    <div id="name" className="name">

                      {
                        !this.state.edit && 
                        <div>
                          <h1 id="profileName">{this.state.fname} {this.state.lname}</h1>
                          <p className="email"><a href={"mailto:" + this.state.user.email}>{email}</a></p>
                        </div>
                      }
                      {
                        this.state.edit &&
                        <div id="editName">
                          <b>Name: </b>
                          <Row>
                            <Input className="inputMob" id="firstName" name="firstName" s={6} label="First Name" onChange={this.inputChange} defaultValue={this.state.fname} style={{backgroundColor: 'white', border: '1px solid lightgray', borderRadius: '5px', paddingLeft: '10px'}}/>
                            <Input className="inputMob" id="lastname" name="lastName" s={6} label="Last Name" onChange={this.inputChange} defaultValue={this.state.lname} style={{backgroundColor: 'white', border: '1px solid lightgray', borderRadius: '5px', paddingLeft: '10px'}} />
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
                  {/* <div className="subheader">
                    <b>Bio:</b>
                    <div className="xtraInfo tooltip pieceTip">
                      <i className="fas fa-question-circle"></i>
                      <span className="tooltiptext">
                        This is the maximum <b className="emphasis">number</b> of 
                        <b className="emphasis"> pieces</b> that you can do during the show run. Each piece rehearses for 
                        <b className="emphasis"> ~4 hours </b> a week.
                      </span>
                    </div> 
                </div> */}
                  {
                    !this.state.edit &&
                    <section>
                        <div className="subheader">
                          <b>Bio:</b>
                        </div>
    
                      {this.state.bio !== "" && this.state.bio}
                      {this.state.bio === "" && " Dancer has no bio"}
                    </section>
                  }
                  {
                    this.state.edit &&
                    <section>
                        <div className="subheader">
                          <b>Bio:</b>
                          <div className="xtraInfo tooltip pieceTip">
                            <i className="fas fa-question-circle"></i>
                            <span className="tooltiptext">
                              This will be your bio in the program of shows that you are participating in. <b className="emphasis">You cannot have a blank bio.</b> Your
                              choreographer will tell you how many words it needs to be for the show, but it is typically 
                              <b className="emphasis"> ~60 words long. </b>
                            </span>
                          </div>
                        </div>
                    <div id="editBio">
                      <div className="row">
                        <form className="col s12">
                          <div className="row">
                            <div className="input-field col s12">
                              <TextField
                                name="bioUpload"
                                className="bioUpload2"
                                hintText={hintText}
                                defaultValue={defaultBio}
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
                  </section>
                  }
                </div>

                <div className="resumeWrap">
                    <div id="resume">
                      {
                        !this.state.edit &&
                        <section>
                          <div className="subheader">
                            <b>Resume:</b>
                            <div className="xtraInfo tooltip pieceTip">
                            <i className="fas fa-question-circle"></i>
                            <span className="tooltiptext">
                              In order to view this resume, you must <b className="emphasis">disable Ad Blocker</b>, if you have it.
                            </span>
                          </div>
                          </div>
                          {this.state.resume === null && <p>Dancer has not uploaded a resume.</p>}
                          {this.state.resume != null && 
                            <a href={this.state.resume}>View PDF Resume</a>
                          }
                        </section>
                      }
                      {
                        this.state.edit &&
                        <section>
                          <div className="subHeader">
                            <b>Resume:  </b>
                            <div className="xtraInfo tooltip pieceTip">
                              <i className="fas fa-question-circle"></i>
                              <span className="tooltiptext">
                                This dance resume is <b className="emphasis">not required</b>, but 
                                could be used to demonstrate more of your skills!
                              </span>
                            </div>
                          </div>
                          <div> Upload your dance resume <b>AS A PDF.</b> </div>
                          <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange} />
                        </section>
                      }
                    </div>
                  </div>

                {
                  !this.state.edit &&
                  <div id="history">
                    <div id="historyTitle" className="subheader">
                      <b>Piece History</b>
                        <div className="xtraInfo tooltip pieceTip">
                          <i className="fas fa-question-circle"></i>
                          <span className="tooltiptext">
                            This is a history of shows you have participated in <b className="emphasis">through this application</b>. We will automatically fill in values.
                          </span>
                        </div>
                      </div>
                    {this.state.history.length > 0 && this.state.history.map((p, i) => {
                      return (
                        <div className="showHistory" key={i}>
                          <p>{p.name + ", " + p.year}</p>
                        </div>
                      )
                    })}
                    {
                      this.state.history.length === 0 &&
                      <p> Dancer has no piece history. <i>We will auto-fill piece history once you start participating in shows.</i></p>

                    }
                  </div>
                  }

              </div>

            </div>
            {
              this.state.edit &&
              <div className="editButtons"> 
                <Button id="edit" className="saveButton" onClick={() => this.onClick()}>Save</Button>
                <Button className="btn cancelButton" onClick={() => this.onCancel()}>Cancel</Button>
              </div>
            }
            {
              this.state.edit &&
              <Button className="deleteAccount" onClick={() => this.setState({deleteConfirmation: true})}> Delete Account </Button>
            }
              <Dialog
                title="Delete Account"
                actions={[
                  <FlatButton
                    label="Cancel"
                    style={{ backgroundColor: 'transparent', color: 'hsl(0, 0%, 29%)', marginRight: '20px' }}
                    primary={false}
                    onClick={() => {this.setState({deleteConfirmation: false})}}
                  />,
                  <FlatButton
                    label="Delete Account"
                    style={{ backgroundColor: '#22A7E0', color: '#ffffff' }}
                    primary={false}
                    keyboardFocused={true}
                    onClick={this.deleteAccount}
                  />,
                ]}
                modal={false}
                open={this.state.deleteConfirmation}
              > 
                <div className="warningText"> 
                By clicking Delete Account, your account will be <strong className="importantText">permanently disabled</strong> and your login credentials will no longer work.
                <br />
                You will have to re-sign up to participate in the site again. You may reuse your email or use a new one.
                {
                  this.state.deleteSuccess &&
                  <p>You will be signed out shortly</p>
                }
                </div>
              </Dialog>
            
          </div>
        </div>
      </section>
    );
  };
}

export default Profile;