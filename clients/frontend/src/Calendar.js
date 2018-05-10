import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './styling/General.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
const VIEWS = ['month', 'week', 'day']
const STYLES = { width: "600px", paddingLeft: "15px" }

let events = [
  {
    id: 3,
    title: 'Weekly Rehearsal',
    start: new Date('2018-05-10 11:00 AM'),
    end: new Date('2018-05-10 12:30 PM')
  }
]

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
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

  render() {
    return (
      <section>
        <div className="toggleHeader">
          <h2 className="smallHeading">Calendar</h2>
          <i className="fas fa-chevron-up fa-lg" onClick={this.toggleCalendar}></i>
        </div>
        <BigCalendar style={{ height: "800px", width: "800px" }}
          selectable
          defaultDate={new Date()}
          defaultView='week'
          events={this.state.events}
          views={VIEWS}
          step={60}
          onSelectEvent={event => alert(event.title)}
          onSelectSlot={slotInfo =>
            alert(
              `selected rehearsal time: \n\nstart ${slotInfo.start.toLocaleString()} ` +
              `\nend: ${slotInfo.end.toLocaleString()}`
            )
          }
        />
      </section>
    );
  };
}

export default Calendar;