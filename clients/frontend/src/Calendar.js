import React, { Component } from 'react';
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
MINTIME.setHours(8,30,0);
const MAXTIME = new Date();
MAXTIME.setHours(23,30,0);

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
      openSetRehearsal : false,
      openNewRehearsal : false,
      events : []
    }
  };

  componentWillMount() {
    this.formatEvents()
  }

  formatEvents = () => {
    //TODO turn this into a route
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

  handleClose = () => {
    this.setState({
      openSetRehearsal : false,
      openNewRehearsal: false
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
    
    //go through all events and delete the one with the same ID
    let events = this.state.events
    events.forEach((e, i) => {
      if(e.id === event.id){
        events.splice(i, i + 1)
      }
    })
    this.setState({
      events : events,
      openSetRehearsal : false
    })
  }

  addRehearsal = () => {
    let slotInfo = this.state.slotInfo
    let events = this.state.events
    let latestID = events[events.length - 1].id + 1

    let rehearsalObject = {
      id : latestID,
      title : this.state.rehearsalName,
      start : new Date(slotInfo.start),
      end : new Date(slotInfo.end)
    }
    events.push(rehearsalObject)

    this.setState({
      events : events,
      openNewRehearsal : false
    })
  }

  render() {
    let event = this.state.event
    let slotInfo = this.state.slotInfo
    console.log(slotInfo)
    return (
      <section>
        <BigCalendar style={{ height: "650px", width: "100%" }}
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
          title={event.title}
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
              keyboardFocused={true}
              onClick={event => this.deleteRehearsal(event)}
            />,
          ]}
          modal={false}
          open={this.state.openSetRehearsal}
          onRequestClose={this.handleClose}
          >
          <div>
            This rehearsal goes from {moment(event.start).format("hh:mm A")} to {moment(event.end).format("hh:mm A")}
          </div>
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
        </Dialog>
      </section>
    );
  };
}

export default Calendar;