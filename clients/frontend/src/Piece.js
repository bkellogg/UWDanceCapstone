import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
let views = ['month', 'week','day']

let events = [
  {
    id: 0,
    title: 'All Day Event very long title',
    allDay: true,
    start: new Date(2015, 3, 0),
    end: new Date(2015, 3, 1),
  },
  {
    id: 1,
    title: 'Long Event',
    start: new Date(2015, 3, 7),
    end: new Date(2015, 3, 10),
  },

  {
    id: 2,
    title: 'DTS STARTS',
    start: new Date(2018, 2, 13, 0, 0, 0),
    end: new Date(2018, 2, 20, 0, 0, 0),
  },
]

class Piece extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toEdit: true
    }
  };

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <h1>My Piece</h1>
          <BigCalendar style={{height : "800px", width: "800px"}}
            defaultView='week'
            events={events}
            views={views}
            step={60}
          />
          </div>
      </section>
  );
};

}
export default Piece;

