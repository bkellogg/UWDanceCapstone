import React, { Component } from 'react';
import * as Util from './util';
import RaisedButton from 'material-ui/RaisedButton';
import './styling/General.css';

//styling
import { Link } from 'react-router-dom';
import './styling/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: JSON.parse(localStorage.user),
      auth: localStorage.auth,
      announcements: [],
      announcementTypes: null,
      currAnnouncements: [],
      pending: []
    }
  };

  componentWillMount() {
    this.getAnnouncements();
    this.getUserPieces()
  }

  //Getting all messages from announcements that have not been deleted
  getAnnouncements = () => {
    Util.makeRequest("announcements?includeDeleted=false", {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        this.setState({
          announcements: data.announcements
        })
        return data.announcements
      })
      .then(announcements => {
        this.getAnnouncementTypes(announcements)
      })
      .catch((err) => {
        Util.handleError(err)
      });
  }

  //Getting announcement types and adding type to each message
  getAnnouncementTypes = (announcements) => {
    Util.makeRequest("announcements/types", {}, "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        let announcementTypes = {};
        data.map(function (announcement) {
          return announcementTypes[announcement.id.toString()] = announcement.name
        })
        return announcementTypes
      })
      .then((announcementTypes) => {
        this.setState({
          announcementTypes: announcementTypes
        })
      })
      .then(() => {
        let currAnnouncements = []
        announcements.map(announcement => {
          return currAnnouncements.push({
            "type": this.state.announcementTypes[announcement.typeID],
            "message": announcement.message
          })
        })
        return currAnnouncements
      })
      .then(currAnnouncements => {
        this.setState({
          currAnnouncements: currAnnouncements
        })
      })
      .catch((err) => { });
  }

  getUserPieces = () => {
    Util.makeRequest("users/me/pieces/pending", "", "GET", true)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(pieces => {
        this.setState({
          pending: pieces
        })
      })
      .catch((err) => {
        console.log(err)
      });
  }

  acceptCasting = (pieceID) => {
    Util.makeRequest("users/me/pieces/" + pieceID, "", "LINK", true)
      .then((res) => {
        if (res.ok) {
          return res.text();
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then(() => {
        this.getUserPieces()
      }
      )
      .catch((err) => {
        console.log(err)
      });
  }

  render() {
    const pending = this.state.pending
    let pendingCasting = pending.map((piece, i) => {
      return (
        <div key={i} className="announcement castBorderColor">
          <p className="announcementMessage">Congratulations! You have been cast in {piece.name}. </p>
          <div>
            <RaisedButton
              label="Accept"
              className="acceptCastButton"
               style={{ color: '#ffffff' }}
               backgroundColor="#22A7E0"
              onClick={() => this.acceptCasting(piece.id)}
            />
          </div>
        </div>
      )
    })
    return (
      <section className='main' >
        <div className="mainView">
          <div className="pageContentWrap">
            <div className='dashboard'>
              <div id='welcome'>
                <h1> Welcome, {this.state.user.firstName}!</h1>
              </div>
              <div id='announcements'>
                {pendingCasting}
                {this.state.user.bio === "" &&
                  <div className="announcement completeProfileBorderColor">
                    <div className="completeProfileCardColor">
                      <p className="announcementMessage"> Please complete your profile. </p>
                    </div>
                  </div>
                }
                {this.state.currAnnouncements.map((anncouncement, index) => {
                  return (
                    <div key={index} className="announcement announcementBorderColor">
                      {
                        <div className="announcementCardColor">
                          <p className="announcementMessage"> {anncouncement.message} </p>
                        </div>
                      }
                    </div>
                  )
                })}

                {this.props.shows.map((anncouncement, index) => {
                  var moment = require('moment');
                  var auditionDay = moment(anncouncement.audition.time).format('MMM. d, YYYY');
                  var auditionTime = moment(anncouncement.audition.time).utcOffset('-0700').format("hh:mm a");
                  var auditionLink = anncouncement.name.split(' ').join('');
                  return (
                    <div key={index} className="announcement newAuditionBorderColor">
                      {
                        <div className="auditionAnnouncementCardColor">
                          <div className="showTitle">
                            <h2 className="auditionHeading">Audition for the {anncouncement.name}</h2>
                          </div>
                          <div className="showInformation">
                            <p> <b>Date:</b> {auditionDay} </p>
                            <p> <b>Time:</b> {auditionTime} </p>
                            <p> <b>Location:</b> {anncouncement.audition.location} </p>
                            <Link to={{ pathname: auditionLink + "/audition" }}>Sign up here!</Link>
                          </div>
                        </div>
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  }
}


export default Dashboard;