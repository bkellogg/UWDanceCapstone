import React, { Component } from 'react';
import * as Util from './util';
import './styling/General.css';
import Moment from 'react-moment';

//styling
import { Card, CardText, CardTitle } from 'material-ui/Card';
import { Link } from 'react-router-dom';
import './styling/Dashboard.css';
import Availability from './Availability';

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
      .catch((err) => { });
  }

  //Getting announcement types and adding type to each message
  getAnnouncementTypes = (announcements) => {
    fetch(Util.API_URL_BASE + "/announcements/types?auth=" + this.state.auth)
      .then((res) => {
        if (res.ok) {
          return res.json();
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
        announcements.map(s => {
          return currAnnouncements.push({
            "type": this.state.announcementTypes[s.typeID],
            "message": s.message
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
          <div className='dashboard'>
            <div id='welcome'>
              <h5> Welcome, {this.state.user.firstName}!</h5>
            </div>
            <div id='announcements'>
              {this.state.user.bio === "" &&
                /*this.state.user.resume &&
                   this.state.user.photo DON'T exist
                   idea: have a boolean indicating if they've uploaded one that get's set
                   during the upload process in SignUpExtra*/
                <Card>
                  <div className="warning">
                    <CardText>
                      Please complete your profile.
                      </CardText>
                  </div>
                </Card>
              }
              {this.state.currAnnouncements.map((v, i) => {
                return (
                  <div key={i} className="announcement">
                    {
                      v.type === 'admin' &&
                      <Card>
                        <div className="cardBody">
                          <CardText>
                            <p> {v.message} </p>
                          </CardText>
                        </div>
                      </Card>
                    }
                  </div>
                )
              })}

              {this.props.shows.map((v, i) => {
                console.log(v.audition.time)
                var moment = require('moment');
                var day = moment(v.audition.time).format('MMM. d, YYYY');
                var time = moment(v.audition.time).utcOffset('-0700').format("hh:mm a");
                var auditionLink = v.name.split(' ').join('');
                return (
                  <div key={i} className="announcement">
                    {
                      <Card>
                        <div className="title">
                          <CardTitle title="Audition"/>
                        </div>
                        <CardText>
                          <p> {v.name} </p>
                          <p> {day} </p>
                          <p> {time} </p>
                          <p> {v.audition.location} </p>
                          <Link to={{ pathname: auditionLink + "/audition" }}>Sign up here!</Link>
                        </CardText>
                      </Card>
                    }
                  </div>
                )
              })}

            </div>
          </div>
        </div>
      </section>
    )
  }

}


export default Dashboard;