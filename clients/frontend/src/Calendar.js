import React, { Component } from 'react';
import * as Util from './util';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import Dialog from 'material-ui/Dialog';
import TextField from 'material-ui/TextField';
import FlatButton from 'material-ui/FlatButton';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styling/General.css';
import './styling/Calendar.css';

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
      modifyRehearsalError: false
    }
  };

  componentWillMount() {
    this.getEvents(this.props.pieceID)
  }

  componentWillReceiveProps(props){
    this.getEvents(props.pieceID)
  }

  getEvents = (pieceID) => {
    Util.makeRequest("pieces/" + pieceID + "/rehearsals", {}, "GET", true)
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
      getRehearsalError: false,
      modifyRehearsalError : false
    })
  }

  onSelectExisting = (slotInfo) => {
    this.setState({
      slotInfo : slotInfo,
      openSetRehearsal : true,
      rehearsalName: slotInfo.title
    })
  }

  onSelectNew = (slotInfo) => {
    this.setState({
      slotInfo : slotInfo,
      openNewRehearsal: true
    })
  }

  deleteRehearsal = () => {
    let slotInfo = this.state.slotInfo
    Util.makeRequest("pieces/" + this.props.pieceID + "/rehearsals?ids=" + slotInfo.id , {}, "DELETE", true)
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
      this.getEvents(this.props.pieceID)
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
      this.getEvents(this.props.pieceID)
    })
    .catch(err => {
      this.setState({
        addRehearsalError : err
      })
      console.error(err)
    })
  }

  modifyRehearsal = (event) => {
    let slotInfo = this.state.slotInfo
    let body = {
      title : this.state.rehearsalName,
      start : moment(slotInfo.start).format("YYYY-MM-DDTHH:mm:ssZ"),
      end : moment(slotInfo.end).format("YYYY-MM-DDTHH:mm:ssZ")
    }
    Util.makeRequest("pieces/" + this.props.pieceID + "/rehearsals/" + slotInfo.id, body, "PATCH", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      if (res.status === 404) {
        return res.text()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then( res => {
      this.setState({
        openSetRehearsal: false,
        openNewRehearsal : false,
        rehearsalName: "Rehearsal"
      })
      this.getEvents(this.props.pieceID)
    })
    .catch(err => {
      this.setState({
        modifyRehearsalError : err
      })
      console.error(err)
    })
  }

  newStart = (e) => {
    let time = e.target.value
    let date = moment(this.state.slotInfo.start).format('YYYY-MM-DD')
    let newStart = date + "T" + time
    newStart = new Date(moment(newStart).format("YYYY-MM-DDTHH:mm:ssZ"))
    let slotInfo = this.state.slotInfo
    slotInfo.start = newStart
    this.setState({
      slotInfo: slotInfo
    })
  }

  newEnd = (e) => {
    let time = e.target.value
    let date = moment(this.state.slotInfo.start).format('YYYY-MM-DD')
    let newEnd = date + "T" + time
    newEnd = new Date(moment(newEnd).format("YYYY-MM-DDTHH:mm:ssZ"))
    let slotInfo = this.state.slotInfo
    slotInfo.end = newEnd
    this.setState({
      slotInfo: slotInfo
    })
  }

  newDate = (e) => {
    let date = e.target.value
    let slotInfo = this.state.slotInfo
    let startTime = moment(slotInfo.start).format("HH:mm")
    let endTime = moment(slotInfo.end).format("HH:mm")
    slotInfo.start = new Date(moment(date + "T" + startTime).format("YYYY-MM-DDTHH:mm:ssZ"))
    slotInfo.end = new Date(moment(date + "T" + endTime).format("YYYY-MM-DDTHH:mm:ssZ"))
    this.setState({
      slotInfo : slotInfo
    })
  }

  render() {
    let slotInfo = this.state.slotInfo
    let defaultView = "week"
    if (window.innerWidth < 617) {
      defaultView = "day"
    }
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
          defaultView={defaultView}
          events={this.state.events}
          views={VIEWS}
          step={30}
          min={this.state.minTime}
          max={this.state.maxTime}
          onSelectEvent={slotInfo => this.onSelectExisting(slotInfo)}
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
              className="negativeButton"
              style={{ marginRight: '10px'}}
              primary={false}
              keyboardFocused={false}
              onClick={event => this.deleteRehearsal(event)}
            />,
            <FlatButton
              label="Save Changes"
              className="positiveButton-noMargin"
              style={{ margin: '0' }}
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
              defaultValue={slotInfo.title}
              floatingLabelText="Rehearsal Name"
              onChange={(event) => this.setState({
                rehearsalName : event.target.value
              })}
            />
            <br />
            <br />
            This rehearsal goes from 
            <input type="time" name="start" defaultValue={moment(slotInfo.start).format("HH:mm")} onChange={this.newStart}/>
            to 
            <input type="time" name="start" defaultValue={moment(slotInfo.end).format("HH:mm")} onChange={this.newEnd}/>
            on 
            <input type="date" name="date" defaultValue={moment(slotInfo.start).format('YYYY-MM-DD')} onChange={this.newDate}/>
          </div>
          {
            this.state.deleteRehearsalError &&
            <div className="serverError">
              Error deleting rehearsal : {this.state.addRehearsalError}
            </div>
          }
          {
            this.state.modifyRehearsalError &&
            <div className="serverError">
              Error modifying rehearsal : {Util.titleCase(this.state.modifyRehearsalError)}
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
              style={{border: '1px solid lightgray', borderRadius: '5px', padding: '10px'}}
              hintText="Rehearsal Name"
              onChange={(event) => this.setState({
                rehearsalName : event.target.value
              })}
            />
            <br />
            <br />
            This rehearsal will go from 
            <input type="time" name="start" defaultValue={moment(slotInfo.start).format("HH:mm")} onChange={this.newStart}/>
            to 
            <input type="time" name="start" defaultValue={moment(slotInfo.end).format("HH:mm")} onChange={this.newEnd}/>
            on 
            <input type="date" name="date" defaultValue={moment(slotInfo.start).format('YYYY-MM-DD')} onChange={this.newDate}/>
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