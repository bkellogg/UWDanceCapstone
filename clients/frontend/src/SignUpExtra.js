import React, { Component } from 'react';
import TextField from 'material-ui/TextField';
import { Button, Input } from 'react-materialize';
import * as Util from './util.js';

import './styling/SignUp.css';

class SignUpExtra extends Component {
  constructor(props) {
    super(props);
    this.skip = this.skip.bind(this);
    this.signUp = this.signUp.bind(this);
    this.inputChange = this.inputChange.bind(this);
    this.resumeChange = this.resumeChange.bind(this);
    this.photoChange = this.photoChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.state = {
      user: null,
      bio: null,
      resumeUpload: null,
      photoUpload: null,
      // User bio word count
      wordCount: null,
    }
  };

  signUp(event) {
    event.preventDefault()
    if (this.state.bio !== null && this.state.bio !== "") {
      this.uploadBio(this.state.bio)
    }
    if (this.state.resumeUpload !== null) {
      this.uploadResume(this.state.resumeUpload)
    }
    if (this.state.photoUpload !== null) {
      this.uploadPhoto(this.state.photoUpload)
    }
    this.props.skip()
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

  uploadBio = (val) => {
    let payload = {
        "bio": val
    };
    Util.makeRequest("users/me", payload, "PATCH", true)
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

  onKeyDown = event => {
    let len = event.target.value.split(/[\s]+/);
    this.setState({
      bio: event.target.value,
      wordCount: len.length,
    });
    if (len.length > 60) {
      if (event.keyCode === 46 || event.keyCode === 8 || (event.keyCode >= 37 && event.keyCode <= 40)) {

      } else if (event.keyCode < 48 || event.keyCode > 57) {
        event.preventDefault();
      }
    }
  }

  //let user skip adding additional info
  skip() {
    this.props.skip();
  }

  render() {
    return (
      <section className="signUpExtra">
        <form className="authenticate">
        <div className="extra-signup-input-field">
          <h2 style={{fontSize: "16px", textAlign:"center"}}>This step is not required.</h2>
            <p>Bio</p>
            <TextField
              className="bioTextbox"
              name="bio"
              style = {{width: '100%'}}
              onKeyDown={this.onKeyDown}>
            </TextField>
            {this.state.wordCount > 60 && (
              <div id="bioWarning">You have reached the max word limit</div>
            )}
          </div>
          <div className="extra-signup-input-field">
            <p>Resume <b>(PDF)</b></p>
            <Input id="resumeUpload" name="resumeUpload" type="file" onChange={this.resumeChange} />
          </div>
          <div className="extra-signup-input-field">
            <p>Headshot</p>
            <input id="photoUpload" name="photoUpload" type="file" onChange={this.photoChange} />
          </div>
        </form>

        <div className="buttons">
          <Button onClick={this.signUp}> Finish Sign Up </Button>
        </div>
        <div className="link">
          <a className="signUpSkipButton" onClick={this.skip}> Skip </a>
        </div>

      </section>
    )
  };
}

export default SignUpExtra;