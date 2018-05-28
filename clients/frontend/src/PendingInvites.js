import React, { Component } from 'react';
import * as Util from './util';
import moment from 'moment';
import RaisedButton from 'material-ui/RaisedButton';
import './styling/Dashboard.css';
import './styling/General.css';

class PendingInvites extends Component {
  constructor(props) {
    super(props);
    this.state = {
      accepted: false,
      declined: false,
      error: false
    }
  }

  acceptCasting = (pieceID) => {
    this.setState({
      error: false
    })
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
        this.setState({
          accepted: true
        })
      }
      )
      .catch((err) => {
        this.setState({
          error: err
        })
        console.log(err)
      });
  }

  declineCasting = (pieceID) => {
    this.setState({
      error: false
    })
    Util.makeRequest("users/me/pieces/" + pieceID, "", "DELETE", true)
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
      this.setState({
        declined: true
      })
    }
    )
    .catch((err) => {
      this.setState({
        error: err
      })
      console.log(err)
    });
  }

  render() {
    let today = moment()
    let createdAt = moment(this.props.piece.createdAt)
    //this will be the difference between createdAt and today subtracted from 48 hours
    let hours = Math.round(48 - moment.duration(today.diff(createdAt)).asHours())
    let expireDateTime = moment(createdAt.add(2, 'days')).format("LLLL")
    console.log(this.props.piece)
    return (
      <div className="announcement castBorderColor">
      {
        !this.state.accepted && !this.state.declined &&
        <div>
          <div className="announcementMessage">
            <p>You have been cast in {this.props.piece.piece.name}. </p>
            <p>{this.props.piece.rehearsalSchedule}</p>
            <p>Your offer will expire in {hours} hours on {expireDateTime}</p>
          </div>
            <RaisedButton
              label="Accept"
              className="acceptCastButton"
              style={{ color: '#ffffff' }}
              backgroundColor="#22A7E0"
              onClick={() => this.acceptCasting(this.props.piece.piece.id)}
            />
            <RaisedButton
              label="Decline"
              className="acceptCastButton"
              style={{ color: '#ffffff' }}
              backgroundColor="#22A7E0"
              onClick={() => this.declineCasting(this.props.piece.piece.id)}
            />
        </div>
      }
      {
        this.state.accepted &&
        <div>
          <p className="announcementMessage">
          Congratulations! You have <b>accepted</b> your casting in {this.props.piece.piece.name}. {this.props.piece.rehearsalSchedule} You can go to My Piece to see more details.
          </p>
        </div>
      }
      {
        this.state.declined &&
        <div>
          <p className="announcementMessage">Next time! You have <b>declined</b> your casting in {this.props.piece.piece.name}. </p>
        </div>
      }
      {
        this.state.error &&
        <div className="serverError">
          {Util.titleCase(this.state.error)}
        </div>
      }
      </div>
    );
  };
}

export default PendingInvites;