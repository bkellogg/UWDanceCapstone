import React, { Component } from 'react';
import * as Util from './util';
import { Button, Input, Row } from 'react-materialize';
import img from './imgs/defaultProfile.jpg';
import './styling/Profile.css';
import './styling/General.css';
import AvatarEditor from 'react-avatar-editor';

class Profile extends Component {
  constructor(props) {
    super(props);
    this.getPhoto = this.getPhoto.bind(this);
    this.onClick = this.onClick.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.resumeChange = this.resumeChange.bind(this);
    this.photoChange = this.photoChange.bind(this);
    this.formatHistory = this.formatHistory.bind(this);
    this.handleScale = this.handleScale.bind(this);
    this.handleRotateRight = this.handleRotateRight.bind(this);
    this.handleRotateLeft = this.handleRotateLeft.bind(this);
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
      width: 300,
      height: 300,
      border: 25,
      color: [255, 255, 255, 0.6],
      scale: 1,
      rotate: 0,
      newPhoto: img,
    }
  };

  componentDidMount() {
    this.getPhoto();
    //this.getHistory();
    this.getResume();

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
        console.log(err);
        Util.handleError(err)
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
        console.log(err)
        Util.handleError(err)
      })
  }

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
          photoSrc: URL.createObjectURL(data),
          newPhoto: URL.createObjectURL(data)
        })
      })
      .catch((err) => {
        console.log(err)
        Util.handleError(err)
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
        console.log(err)
        Util.handleError(err)
      });
  }

  uploadPhoto = (val) => {
    let file = val;
    let data = new FormData();
    data.append("image", file.files[0]);
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

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/photo");
    xhr.setRequestHeader("Authorization", Util.getAuth());
    xhr.setRequestHeader("ImageFieldName", "image");

    xhr.send(data);
  }

  uploadResume = (val) => {
    let file = val;
    let data = new FormData();
    data.append("resume", file.files[0]);

    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", () => {
      if (this.readyState === 4) {
        this.getResume()
      }
    });

    xhr.onreadystatechange = function () {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status < 400) {
          return xhr.responseText
        }
      }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/resume");
    xhr.setRequestHeader("Authorization", Util.getAuth());
    xhr.setRequestHeader("ResumeFieldName", "resume");

    xhr.send(data);
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
      photoUpload: val.target,
    })
    console.log(this.state.photoUpload)
  }

  handleScale(event) {
    this.setState({
      scale: event.target.value
    })
  }

  handleRotateRight(event) {
    let value = this.state.rotate;
    let newValue = value + 90;
    this.setState({
      rotate: newValue
    })
  }

  handleRotateLeft(event) {
    let value = this.state.rotate;
    let newValue = value - 90;
    this.setState({
      rotate: newValue
    })
  }

  onClickSave = () => {
    if (this.editor) {
      //const canvasScaled = this.editor.getImageScaledToCanvas()
      const canvas = this.editor.getImage().toDataURL();
      let imageURL;
      fetch(canvas)
        .then(res => res.blob())
        .then(blob => (imageURL = window.URL.createObjectURL(blob)))
        .then((data) => {
          this.setState({
            newPhoto: data
          })
          console.log(this.state.newPhoto)
        })
    }
  }

  setEditorRef = (editor) => this.editor = editor

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <h1 className="pagetitle">Your Profile </h1>


          <div className="card1">
            {/* FIRST CARD */}
            <div className="headerBorder">
              <div className="header">
                <div className="photoContainerWrap">
                  <div id="photoContainer" className="photoContainer">
                    {!this.state.edit &&

                      <img id="photo" alt="profile" src={this.state.photoSrc}></img>
                    }
                    {this.state.edit &&
                      <section>
                        <div> Upload a head shot as a jpg file. </div>
                        <div>
                          <AvatarEditor
                            ref={this.setEditorRef}
                            image={this.state.newPhoto}
                            width={this.state.width}
                            height={this.state.height}
                            border={this.state.border}
                            color={this.state.color} // RGBA
                            scale={this.state.scale}
                            rotate={this.state.rotate}
                          />

                          <div>Zoom:
                          <input type="range" min="1" max="2" step="0.01" onChange={this.handleScale} /></div>
                          <div>Rotate:
                            <button type="button" onClick={this.handleRotateLeft}>Left</button>
                            <button type="button" onClick={this.handleRotateRight}>Right</button>
                          </div>
                        </div>

                        <button type="button" onClick={this.onClickSave}>Edit Photo</button>

                        <Input id="photoUpload" name="photoUpload" type="file" onClick={this.onClickSave} />
                      </section>
                    }
                  </div>
      <div className="mainView">
      <h1 className="pagetitle">Your Profile </h1>

        <div className="card1">
          {/* FIRST CARD */}
          <div className="wrap">
            <div className="header">
              <div className="photoContainerWrap">
                <div id="photoContainer" className="photoContainer">
                  {!this.state.edit &&

                    <img id="photo" alt="profile" src={this.state.photoSrc}></img>
                  }
                  {this.state.edit &&
                    <section>
                      <div> Upload a head shot as a jpg file. </div>
                      <Input id="photoUpload" name="photoUpload" type="file" onChange={this.photoChange} />
                    </section>
                  }
                </div>

                <div className="nameAndBioWrap">
                  <div id="name" className="name">

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
                                <textarea id="textarea1" name="bioUpload" s={6} className="materialize-textarea" onChange={this.inputChange}></textarea>
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
                  <Button id="edit" className="btn-floating btn-large" onClick={() => this.onClick()}>
                    <i className="large material-icons"> mode_edit </i>
                  </Button>

                }
                {this.state.edit &&
                  <Button id="edit" className="btn-floating btn-large" onClick={() => this.onClick()}>
                    <i className="large material-icons"> check </i>
                  </Button>
                }
              </div>
            </div>
          </div>

          <div className="card2">

            {/* SECOND CARD */}
            <div className="mainContentBorder">
              <div id="history">
                <div id="historyTitle" className="subheader"><b>Piece History:</b></div>
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
                    <a href={this.state.resume} target="_blank">View PDF Resume</a>

                  </section>
                }
                {this.state.edit &&
                  <section>
                    <div> Upload your dance resume as a PDF. </div>
                    <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange} />
                  </section>
                }
              </div>

            </div>


          </div>

              {!this.state.edit &&
                <Button id="edit" className="btn-medium" onClick={() => this.onClick()}>Edit Profile
                  {/* <i className="large material-icons"> mode_edit </i> */}
                </Button>

              }
              {this.state.edit &&
                <Button id="edit" className="btn-medium" onClick={() => this.onClick()}>Save Changes
                  {/* <i className="large material-icons"> check </i> */}
                </Button>
              }
        </div>
      </section>
    );
  };
}

export default Profile;