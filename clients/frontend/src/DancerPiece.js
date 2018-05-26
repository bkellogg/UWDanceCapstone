import React, { Component } from 'react';
import * as Util from './util.js';
import BigCalendar from 'react-big-calendar';
import Dialog from 'material-ui/Dialog';
import moment from 'moment';
import './styling/Piece.css';
import './styling/General.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
const VIEWS = ['month', 'week', 'day']
const MINTIME = new Date();
MINTIME.setHours(8,0,0);
const MAXTIME = new Date();
MAXTIME.setHours(23,0,0);


class DancerPiece extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: {
        title: "",
        start: new Date(),
        end: new Date(),
      },
      openSetRehearsal: false,
      minTime : MINTIME,
      maxTime : MAXTIME,
      openCast : false,
      openCalendar: true,
      events : [],
      dancers : [],
      getRehearsalError: [],
      choreographer: {role:{}}
    } 
  };

  componentWillMount() {
    //this.formatEvents()
    this.getPieceUsers()
  }

  getPieceUsers = (pieceID) => {
    //TODO deal with pages
    for(let i = 1; i <= Util.PAGEMAX; i++) {
      Util.makeRequest("pieces/" + this.props.pieceID + "/users?page=" + i, "", "GET", true)
        .then(res => {
          if (res.ok) {
            return res.json()
          }
          if (res.status === 401) {
            Util.signOut()
          }
          return res
            .text()
            .then((t) => Promise.reject(t));
        })
        .then(piece => {
          let currDancers = this.state.dancers
          let newDancers = currDancers.concat(piece.dancers)
          this.setState({
            choreographer: piece.choreographer,
            dancers: newDancers
          })
        })
        .catch((err) => {
          console.error(err)
        })
    }
  }

  getEvents = () => {
    Util.makeRequest("pieces/" + this.props.pieceID + "/rehearsals", {}, "GET", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(events => {
      this.formatEvents(events)
    })
    .catch(err => {
      this.setState({
        getRehearsalError : err
      })
      console.error(err)
    })
  }

  formatEvents = (events) => {
    let formattedEvents = []
    events.forEach((event) => {
      let start = new Date(event.start)
      let end = new Date(event.end)
      let tempEvent = {
        id : event.id,
        title : event.title,
        start : start,
        end : end
      }
      formattedEvents.push(tempEvent)
    })
    this.setState({
      events : formattedEvents
    })
  }

  onSelectExisting = (event) => {
    this.setState({
      event : event,
      openSetRehearsal : true
    })
  }

  handleClose = () => {
    this.setState({
      openSetRehearsal : false,
    })
  }

  toggleCast = () => {
    let opp = this.state.openCast
    this.setState({
      openCast: !opp
    })
  }

  toggleCalendar = () => {
    let opp = this.state.openCalendar
    this.setState({
      openCalendar: !opp
    })
  }

  render() {
    let event = this.state.event

    let castRows = this.state.dancers.map((dancer, i) => {
      return (
        <tr key={i}>
          <td>
            {dancer.firstName + " " + dancer.lastName}
          </td>
          <td>
            {dancer.role.displayName}
          </td>
          <td>
            <a href={"mailto:" + dancer.email}>{dancer.email}</a>
          </td>
        </tr>
      )
    })

    let choreographer = (<tr key={this.state.choreographer.id} style={{backgroundColor:"lightgray"}}>
      <td >
        {this.state.choreographer.firstName + " " + this.state.choreographer.lastName}
      </td>
      <td>
        {this.state.choreographer.role.displayName}
      </td>
      <td>
        <a href={"mailto:" + this.state.choreographer.email}>{this.state.choreographer.email}</a>
      </td>
    </tr>)
    return (
      <section className="pieceCard">
        <div className="pieceCardContents">
          <h1>{this.props.pieceName}</h1>
          <div className="fullWidthCard dancerPieceToggle">
            {
              !this.state.openCalendar &&
              // Styling for toggle header is in general
                <div className="toggleHeader clickable" onClick={this.toggleCalendar}>
                  <h2 className="smallHeading">Calendar</h2>
                  <i className="fas fa-chevron-down fa-lg"></i>
                </div>
            }
            {
              this.state.openCalendar &&
              <section>
                <div className="toggleHeader clickable" onClick={this.toggleCalendar}>
                  <h2 className="smallHeading">Calendar</h2>
                  <i className="fas fa-chevron-up fa-lg"></i>
                </div>
                <p>Access the full tech schedule here: {<a href="http://staff.washington.edu/peterb5/Prod%20Shed/ProdScheds.html" target="_blank">UW Dance Production Site</a>}</p>
                <BigCalendar style={{ height: "710px", width: "100%" }}
                  defaultDate={new Date()}
                  defaultView='week'
                  events={this.state.events}
                  views={VIEWS}
                  step={30}
                  min={this.state.minTime}
                  max={this.state.maxTime}
                  onSelectEvent={event => this.onSelectExisting(event)}
                />
              </section>
            }
          </div>
          <div className="fullWidthCard dancerPieceToggle">
            {
              !this.state.openCast &&
              // Styling for toggle header is in general
              <div className="toggleHeader clickable" onClick={this.toggleCast}>
                <h2 className="smallHeading">My Cast</h2>
                <i className="fas fa-chevron-down fa-lg"></i>
              </div>
            }
            {
              this.state.openCast &&
              <section>
                <div className="toggleHeader clickable" onClick={this.toggleCast}>
                  <h2 className="smallHeading">My Cast</h2>
                  <i className="fas fa-chevron-up fa-lg"></i>
                </div>
                <table>
                  <tbody>
                    <tr className="categories">
                      <th>Name</th>
                      <th>Role</th>
                      <th>Email</th>
                    </tr>
                    {choreographer}
                    {castRows}
                  </tbody>
                </table>
              </section>
            }
          </div>
          <Dialog
            title={event.title}
            actions={[]}
            modal={false}
            open={this.state.openSetRehearsal}
            onRequestClose={this.handleClose}
            >
            <div>
              This rehearsal goes from {moment(event.start).format("hh:mm A")} to {moment(event.end).format("hh:mm A")}
            </div>
          </Dialog>
        </div>
      </section>
  );
};
}
export default DancerPiece;