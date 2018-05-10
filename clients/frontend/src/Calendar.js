import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import Button from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styling/General.css';
import RehearsalRow from './RehearsalRow';

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
      events : [
        {
          id: 3,
          title: 'Weekly Rehearsal',
          start: new Date('2018-05-10 11:00 AM'),
          end: new Date('2018-05-10 12:30 PM')
        }
      ]
    }
  };

  componentWillMount() {
    this.formatEvents()
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

  render() {
    let event = this.state.event
    let slotInfo = this.state.slotInfo
    return (
      <section>
        <BigCalendar style={{ height: "800px", width: "800px" }}
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
              onClick={this.handleClose}
            />,
          ]}
          modal={false}
          open={this.state.openSetRehearsal}
          onRequestClose={this.handleClose}
          >
          <div>
            This rehearsal goes from {event.start.toLocaleTimeString()} to {event.end.toLocaleTimeString()}
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
              onClick={this.handleClose}
            />,
          ]}
          modal={false}
          open={this.state.openNewRehearsal}
          onRequestClose={this.handleClose}
          >
          <div>
            This rehearsal will go from {slotInfo.start.toLocaleTimeString()} to {slotInfo.end.toLocaleTimeString()} on {slotInfo.start.toLocaleDateString()}
          </div>
        </Dialog>
      </section>
    );
  };
}

export default Calendar;