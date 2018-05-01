import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Button, Input, Row } from 'react-materialize';

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
  {
    id: 3,
    title: 'Weekly Rehearsal',
    start: new Date(2018, 5, 1, 0, 0, 0),
    end: new Date(2018, 5, 1, 0, 0, 0)
  }
]

class Piece extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewAvailability: false
    }
  };

  viewAvailability = () => {
    let view = this.state.viewAvailability
    this.setState({
      viewAvailability : !view
    })
  }

  render() {
    return (
      <section className="main">
        <div className="mainView">
          <h1>My Piece</h1>
          <BigCalendar style={{height : "800px", width: "800px"}}
            selectable
            defaultView='week'
            events={events}
            views={views}
            step={60}
            onSelectEvent={event => alert(event.title)}
            onSelectSlot={slotInfo =>
              alert(
                `selected rehearsal time: \n\nstart ${slotInfo.start.toLocaleString()} ` +
                  `\nend: ${slotInfo.end.toLocaleString()}`
              )
            }
          />
          <div>
            My Cast
            <p>list of dancers in my cast</p>
            {
              !this.state.viewAvailability &&
              <Button onClick={this.viewAvailability}> View Cast Availability </Button>
            }
            {
              this.state.viewAvailability &&
              <div>
                <Button onClick={this.viewAvailability}> Hide Cast Availabiltiy </Button>
                <p>View availability ay</p>
              </div>
            }
          </div>
          <div>
            Information Sheet
            <div className="choreoContact">
              <p>display choreographers name here</p>
              <p><strong>input for phone number here</strong></p>
              <p>display choreographers email here</p>
            </div>
            <div className="dancerInfo">
              <p>display num dancers</p>
              <p>list of dancers, phone numbers???, and email</p> 
            </div>
            <div className="pieceInfo">
              <p><strong>Dance Title</strong></p>
              <p><strong>runtime</strong></p>
              <p><strong>Composer(s)</strong></p>
              <p><strong>Music title(s)</strong></p>
              <p><strong>Performed By</strong></p>
              <p><strong>Music source</strong></p>
              <p><strong>If music will be performed live, number of musicians</strong></p>
              <div className="musicianInfo">
                <p><strong>List of contact info for musicians</strong></p>
                <p><strong>Name, Phone Number, Email address</strong></p>
              </div>
              <p>display rehearsal schedule</p>
            </div>
            <div className="notes">
              <p><strong>Choreographers Notes</strong></p>
              <p><strong>Costume Descriptions</strong></p>
              <p><strong>Props/Scenic Items Descriptions</strong></p>
              <p><strong>Lighting Description</strong></p>
              <p><strong>Other special needs</strong></p>
            </div>
          </div>
        </div>
      </section>
  );
};

}
export default Piece;

