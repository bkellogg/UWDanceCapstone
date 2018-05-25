import React, { Component } from 'react';
import * as Util from './util';
import img from './imgs/defaultProfile.jpg';
import './styling/Profile.css';
import './styling/General.css';

class StaticProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userID: this.props.match.params.userID,
      user: {},
      auth: localStorage.auth,
      photoSrc: img,
      bio: "",
      history: [],
      resume: null,
    }
  };

  componentDidMount() {
    this.getUser();
    this.getPhoto();
    this.getResume();

    //TODO deal with the fact that there are going to be pages
    Util.makeRequest("users/" + this.state.userID + "/shows?history=all", {}, "GET", true)
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
    Util.makeRequest("users/" + this.state.userID + "/photo", {}, "GET", true)
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
    Util.makeRequest("users/" + this.state.userID + "/resume", {}, "GET", true)
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

  getUser = () => {
    Util.makeRequest("users/" + this.state.userID, "", "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(user => {
        this.setState({
          user: user
        })
      })
      .catch((err) => {
        console.error(err)
        Util.handleError(err)
      });
  }

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1 className="pagetitle">Dancer Profile </h1>

            <div className="fullWidthCard">
              {/* FIRST CARD */}
              <div className="wrap">
                <div className="header">
                  <div id="photoContainer" className="photoContainer">
                    <img id="photo" alt="profile" src={this.state.photoSrc}></img>
                  </div>


                  <div className="nameWrap">
                    <div id="name" className="name">
                      <h1 id="profileName">{this.state.user.firstName} {this.state.user.lastName}</h1>
                    </div>
                  </div>
                    </div>


                </div>
                <div className="mainContentBorder">
                <div id="bio" className="bio">
                        <div className="subheader"><b>Dancer Bio:</b></div>
                        <section>
                          {this.state.user.bio !== "" && this.state.user.bio}
                          {this.state.user.bio === "" && " Dancer has no bio"}
                        </section>
                      </div>
                      <div className="resumeWrap">
                    <div id="resume">
                      <section>
                        {this.state.resume === null && <p>Dancer has not uploaded a resume.</p>}
                        {this.state.resume != null && (
                          <div>
                            <a href={Util.API_URL_BASE + "users/" + this.state.userID + "/resume?auth=" + this.state.auth} target="_blank">View PDF Resume</a>
                          </div>
                        )}

                      </section>
                    </div>
                    </div>
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



                </div>


              </div>
            </div>
          </div>
      </section>
        );
      };
    }
    
export default StaticProfile;