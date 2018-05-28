import React, { Component } from 'react';
import * as Util from './util';
import moment from 'moment';
import PendingInvites from './PendingInvites';
import Button from 'react-materialize/lib/Button';
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
            "message": announcement.message,
            "createdAt": announcement.createdAt,
            "createdBy": announcement.createdBy
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
    Util.makeRequest("users/me/pieces/invites", "", "GET", true)
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

  render() {
    const pending = this.state.pending
    let pendingCasting = pending.map((piece, i) => {
      return (
        <PendingInvites key={i} piece={piece} />
      )
    })
    let displayAnnouncements = this.state.currAnnouncements.map((announcement, index) => {
      return (
        <div key={index} className="announcement announcementBorderColor">
          {
            <div className="announcementCardColor">
              <div className="announcementMessage">
              <p>{announcement.message}</p>
              <p> <em>{announcement.createdBy.firstName + " " + announcement.createdBy.lastName + ", " + moment(announcement.createdAt).format("MM/DD/YY hh:mm A")}</em></p>
              </div>
            </div>
          }
        </div>
      )
    })
    let displayShows = this.props.shows.map((announcement, index) => {
      let auditionDay = moment(announcement.audition.time).format('MMM. Do, YYYY');
      let auditionTime = moment(announcement.audition.time).utcOffset('-0700').format("hh:mm a");
      let auditionLink = announcement.name.split(' ').join('');
      //check that the day of the audition hasn't passed
      let today = moment()
      let time = moment(announcement.audition.time).utcOffset('-0700')
      if (!today.isBefore(time)) {
        return []
      }
      return (
        <div key={index} className="announcement newAuditionBorderColor">
          {
            <div className="auditionAnnouncementCardColor">
              <div className="showInformation">
                <h2 className="auditionHeading">Audition for the {announcement.name}</h2>

                  <p> <b>Date:</b> {auditionDay} </p>
                  <p> <b>Time:</b> {auditionTime} </p>
                  <p> <b>Location:</b> {announcement.audition.location} </p>

                </div>
                <div className="buttonToSignUp">
                  <Button> <Link className="linkTurnedIntoButton" to={{ pathname: auditionLink + "/audition" }}>Sign up here!</Link></Button>
                </div>
              </div>
              }
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
                      <div className="announcement completeProfileBorderColor clickable" onClick={() => window.location = "/profile"}>
                        <div className="completeProfileCardColor">
                          <p className="announcementMessage"> Please complete your profile. </p>
                        </div>
                      </div>
                    }
                    {displayAnnouncements}
                    {displayShows}
                  </div>
                </div>
              </div>
            </div>
          </section>
          )
        }
      }
      
      
export default Dashboard;