import React, { Component } from 'react';
import * as Util from './util';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styling/General.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
const VIEWS = ['month', 'week', 'day']
const MINTIME = new Date();
MINTIME.setHours(8,0,0);
const MAXTIME = new Date();
MAXTIME.setHours(23,0,0);


class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      event: {
        title: "",
        start: new Date(),
        end: new Date(),
      },
      slotInfo: {
        start: new Date(),
        end: new Date(),
      },
      minTime : MINTIME,
      maxTime : MAXTIME,
      rehearsalName: "Rehearsal",
      openSetRehearsal : false,
      openNewRehearsal : false,
      events : [],
      getRehearsalError: false,
      addRehearsalError: false,
      deleteRehearsalError: false,
    }
  };

  componentWillMount() {
    this.getEvents()
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

  handleClose = () => {
    this.setState({
      openSetRehearsal : false,
      openNewRehearsal: false,
      addRehearsalError: false,
      deleteRehearsalError: false,
      getRehearsalError: false
    })
  }

  onSelectExisting = (event) => {
    this.setState({
      event : event,
      openSetRehearsal : true
    })
  }

  onSelectNew = (slotInfo) => {
    this.setState({
      slotInfo : slotInfo,
      openNewRehearsal: true
    })
  }

  deleteRehearsal = () => {
    let event = this.state.event
    Util.makeRequest("pieces/" + this.props.pieceID + "/rehearsals?ids=" + event.id , {}, "DELETE", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then( res => {
      this.setState({
        openSetRehearsal : false
      })
      this.getEvents()
    })
    .catch(err => {
      this.setState({
        deleteRehearsalError : err
      })
      console.error(err)
    })
  }

  addRehearsal = () => {
    let slotInfo = this.state.slotInfo
    let body = []
    let rehearsalObject = {
      title : this.state.rehearsalName,
      start : moment(slotInfo.start).format("YYYY-MM-DDTHH:mm:ssZ"),
      end : moment(slotInfo.end).format("YYYY-MM-DDTHH:mm:ssZ")
    }
    body.push(rehearsalObject)
    Util.makeRequest("pieces/" + this.props.pieceID + "/rehearsals", body, "POST", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then( res => {
      this.setState({
        openNewRehearsal : false,
        rehearsalName: "Rehearsal"
      })
      this.getEvents()
    })
    .catch(err => {
      this.setState({
        addRehearsalError : err
      })
      console.error(err)
    })
  }

  modifyRehearsal = (event) => {

  }

  render() {
    let event = this.state.event
    let slotInfo = this.state.slotInfo
    return (
      <section>
        {
          this.getRehearsalError &&
          <div className="serverError">
            Error getting piece rehearsals: {Util.titleCase(this.getRehearsalError)}
          </div>
        }
        <BigCalendar style={{ height: "710px", width: "100%" }}
          selectable
          defaultDate={new Date()}
          defaultView='week'
          events={this.state.events}
          views={VIEWS}
          step={30}
          min={this.state.minTime}
          max={this.state.maxTime}
          onSelectEvent={event => this.onSelectExisting(event)}
          onSelectSlot={slotInfo => this.onSelectNew(slotInfo)}
        />

        {/*this is for deleting rehearsals that have been set*/}
        <Dialog
          title="Edit Rehearsal"
          actions={[
            <FlatButton
              label="Cancel"
              style={{ backgroundColor: 'transparent', color: 'hsl(0, 0%, 29%)', marginRight: '20px' }}
              primary={false}
              onClick={this.handleClose}
            />,
            <FlatButton
              label="Delete Rehearsal"
              style={{ backgroundColor: '#22A7E0', color: '#ffffff' }}
              primary={false}
              keyboardFocused={false}
              onClick={event => this.deleteRehearsal(event)}
            />,
            <FlatButton
              label="Save Changes"
              style={{ backgroundColor: '#22A7E0', color: '#ffffff' }}
              primary={false}
              keyboardFocused={false}
              onClick={event => this.modifyRehearsal(event)}
            />
          ]}
          modal={false}
          open={this.state.openSetRehearsal}
          onRequestClose={this.handleClose}
          >
          <div>
            <TextField
              defaultValue={event.title}
              onChange={(event) => this.setState({
                rehearsalName : event.target.value
              })}
            />
            <br />
            <br />
            This rehearsal goes from 
            <input type="time" name="start" defaultValue={moment(event.start).format("HH:mm")}/>
            to 
            <input type="time" name="start" defaultValue={moment(event.end).format("HH:mm")} />
            on 
            <input type="date" name="date" defaultValue={moment(event.start).format('YYYY-MM-DD')} />
          </div>
          {
            this.state.deleteRehearsalError &&
            <div className="serverError">
              Error deleting rehearsal : {this.state.addRehearsalError}
            </div>
          }
        </Dialog>

        {/*this is the dialoge for adding a new one time rehearsal*/}
        <Dialog
          title={"Create New Rehearsal"}
          actions={[
            <FlatButton
              label="Cancel"
              style={{ backgroundColor: 'transparent', color: 'hsl(0, 0%, 29%)', marginRight: '20px' }}
              primary={false}
              onClick={this.handleClose}
            />,
            <FlatButton
              label="Set Rehearsal"
              style={{ backgroundColor: '#22A7E0', color: '#ffffff' }}
              primary={false}
              keyboardFocused={true}
              onClick={this.addRehearsal}
            />,
          ]}
          modal={false}
          open={this.state.openNewRehearsal}
          onRequestClose={this.handleClose}
          >
          <div>
            <TextField
              hintText="Rehearsal Name"
              onChange={(event) => this.setState({
                rehearsalName : event.target.value
              })}
            />
            <br />
            <br />
            This rehearsal will go from 
            <input type="time" name="start" defaultValue={moment(slotInfo.start).format("HH:mm")}/>
            to 
            <input type="time" name="start" defaultValue={moment(slotInfo.end).format("HH:mm")} />
            on 
            <input type="date" name="date" defaultValue={moment(slotInfo.start).format('YYYY-MM-DD')} />
          </div>
          {
            this.state.addRehearsalError &&
            <div className="serverError">
              Error setting rehearsal : {Util.titleCase(this.state.addRehearsalError)}
            </div>
          }
        </Dialog>
      </section>
    );
  };
}

export default Calendar;