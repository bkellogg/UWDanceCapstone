import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
let views = ['month', 'week','day']

const events = []

class DancerPiece extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       viewAvailability: false
//     }
//   };

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

