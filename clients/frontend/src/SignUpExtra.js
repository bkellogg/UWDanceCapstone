import React, { Component } from 'react';
import { compose } from 'ramda';
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
      wordCount: 0,
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

    xhr.open("POST", Util.API_URL_BASE + "users/me/photo");
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

    xhr.open("POST", Util.API_URL_BASE + "users/me/resume");
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

  onKeyDown = value => {
    const trimmedValue = value.target.value.trim();
    const words = compose(this.removeEmptyElements, this.removeBreaks)(trimmedValue.split(' '));
    
    this.setState({
      bio: value,
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

  //let user skip adding additional info
  skip() {
    this.props.skip();
  }

  render() {
    return (
      <section className="signUpExtra">
        <form className="authenticate">
          <div className="extra-signup-input-field">
            <p>Bio (60 words or less)</p>
            <textarea id="textarea" name="bio" s={6} className="bioTextbox"  onChange={this.onKeyDown}></textarea>
            <p><strong>Word Count:</strong> {this.state.wordCount}</p>
          </div>
          <div className="extra-signup-input-field">
            <p>Resume (PDF)</p>
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