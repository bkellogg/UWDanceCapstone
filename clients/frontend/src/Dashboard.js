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
      auditionInfo: [],
      audAnnouncements: [],
      currAuditionAnnouncements: []
    }
  };

  componentDidMount() {
    this.getAnnouncements();
    this.getAuditionInfo();
  }

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


  getAuditionInfo = () => {
    var val;
    var activeShows = this.props.shows;
    for (val in activeShows) {
      var audNum = (activeShows[val].audition);
      this.getAudition(audNum, activeShows);
    }
  }

  getAudition = (num, activeShows) => {
    fetch(Util.API_URL_BASE + "/auditions/" + num + "?auth=" + this.state.auth)
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .then((data) => {
        let auds = this.state.auditionInfo.slice();
        auds.push(data);
        this.setState({
          auditionInfo: auds
        })
      })
      .then( () => {
        let currAuditionAnnouncements = [];
        console.log("Shows")
        console.log(activeShows)
        
        let auditionInfo = this.state.auditionInfo;
        console.log("Audition Info")
        console.log(auditionInfo)

        auditionInfo.map(s => {
          return currAuditionAnnouncements.push({
            id: s.id,
            type: "Audition",
            show: (activeShows.find(e => e.audition === s.id).name),
            time: s.time,
            location: s.location,
            address: (activeShows.find(e => e.audition === s.id).name).split(' ').join('')
          });
        });
        return currAuditionAnnouncements
      })
      .then(currAuditionAnnouncements => {
        this.setState({
          currAuditionAnnouncements: currAuditionAnnouncements
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

              {this.state.currAuditionAnnouncements.map((v, i) => {
                return (
                  <div key={i} className="announcement">
                    {
                      v.type === 'Audition' &&
                      <Card>
                        <div className="title">
                          <CardTitle title={v.type} />
                        </div>
                        <CardText>
                          <p> {v.show} </p>
                          <p> {v.time} </p>
                          <p> {v.location} </p>
                          <Link to={{ pathname: v.address + "/audition" }}>Sign up here!</Link>
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