import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
const VIEWS = ['month', 'week', 'day']
const MINTIME = new Date();
MINTIME.setHours(8,30,0);
const MAXTIME = new Date();
MAXTIME.setHours(23,30,0);


class DancerPiece extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minTime : MINTIME,
      maxTime : MAXTIME,
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
      <section className="main">
        <div className="mainView">
          <h1>My Piece</h1>
          <BigCalendar style={{ height: "800px", width: "800px" }}
          defaultDate={new Date()}
          defaultView='week'
          events={this.state.events}
          views={VIEWS}
          step={60}
          min={this.state.minTime}
          max={this.state.maxTime}
          onSelectEvent={event => alert(event.title)}
        />
          <div>
            Cast
            <p>list of dancers in the cast</p>
          </div>
        </div>
      </section>
  );
};

}
export default DancerPiece;

