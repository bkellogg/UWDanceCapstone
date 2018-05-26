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
      openCalendar: false,
      events : [],
      dancers : []
    } 
  };

  componentWillMount() {
    this.formatEvents()
    //this.getPieceID()
  }

  getPieceID = () => {
    Util.makeRequest("users/me/pieces", "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        //this is if there is no piece
        if (res.status === 404) {
          this.setState({
            error : true
          })
        }
        return res
          .text()
          .then((t) => Promise.reject(t));
      })
      .then(piece => {
        this.setState({
          pieceID : piece.id
        })
        this.getPieceUsers(piece.id)
      })
      .catch((err) => {
        console.error(err)
      })
  }

  getPieceUsers = (pieceID) => {
    //TODO deal with pages
    for(let i = 1; i < Util.PAGEMAX; i++) {
      Util.makeRequest("pieces/" + pieceID + "/users?page=" + i, "", "GET", true)
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

  formatEvents = () => {
    let events = JSON.parse(localStorage.rehearsals)
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

  render() {
    let event = this.state.event
    return (
      <section className="main">
        <div className="mainView">
          <div className="pageContentWrap">
            <h1>My Piece</h1>
            {
              this.state.error && 
              <div>
                You have not been cast in a piece yet.
              </div>
            }
            {
              !this.state.error &&
              <section>
                <div className="fullWidthCard">
                  {
                    !this.state.openCalendar &&
                    // Styling for toggle header is in general
                    <div className="toggleHeader" onClick={this.toggleCalendar}>
                      <h2 className="smallHeading">Calendar</h2>
                      <i className="fas fa-chevron-down fa-lg"></i>
                    </div>
                  }
                  {
                    this.state.openCalendar &&
                    <section>
                      <div className="toggleHeader" onClick={this.toggleCalendar}>
                        <h2 className="smallHeading">Calendar</h2>
                        <i className="fas fa-chevron-up fa-lg"></i>
                      </div>
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
                <div className="fullWidthCard">
                  {
                    !this.state.openCast &&
                    // Styling for toggle header is in general
                    <div className="toggleHeader" onClick={this.toggleCast}>
                      <h2 className="smallHeading">My Cast</h2>
                      <i className="fas fa-chevron-down fa-lg"></i>
                    </div>
                  }
                  {
                    this.state.openCast &&
                    <section>
                      <div className="toggleHeader" onClick={this.toggleCast}>
                        <h2 className="smallHeading">My Cast</h2>
                        <i className="fas fa-chevron-up fa-lg"></i>
                      </div>
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
              </section>
            }
          </div>
        </div>
      </section>
  );
};
}
export default DancerPiece;