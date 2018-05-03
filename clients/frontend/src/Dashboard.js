import React, { Component } from 'react';
import * as Util from './util';
import './styling/General.css';

//styling
import { Card, CardText } from 'material-ui/Card';
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
    }
  };

  componentWillMount() {
    this.getAnnouncements();
  }

  //Getting all messages from announcements that have not been deleted
  getAnnouncements = () => {
    fetch(Util.API_URL_BASE + "/announcements?includeDeleted=false&auth=" + this.state.auth)
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
    fetch(Util.API_URL_BASE + "/announcements/types?auth=" + this.state.auth)
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

  render() {
    return (
      <section className='main' >
        <div className="mainView">
        <div className="transparentCard">
          <div className='dashboard'>
            <div id='welcome'> 
            <h1> Welcome, {this.state.user.firstName}!</h1>
            </div>
            <div id='announcements'>
              {this.state.user.bio === "" &&
                    <Card>
                    <div className="warning">
                      <CardText> 
                        Please complete your profile.
                      </CardText>
                  </div>
                </Card>
              }
              {this.state.currAnnouncements.map((anncouncement, index) => {
                return (
                  <div key={index} className="announcement">
                    {
                      <div className="cardBody">
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
                  <div key={index} className="announcement secondColor">
                  <div className="cardBody">
                    {

                      <div className="auditionAnnouncementCard">
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