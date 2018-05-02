import React, { Component } from 'react';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Button from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MusicianRow from './MusicianRow';
import './styling/General.css';

BigCalendar.setLocalizer(BigCalendar.momentLocalizer(moment))
let views = ['month', 'week','day']
const STYLES = {width: "600px", paddingLeft: "15px"}

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
      viewAvailability: false,
      numMusicians: 0
    }
  };

  viewAvailability = () => {
    let view = this.state.viewAvailability
    this.setState({
      viewAvailability : !view
    })
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleChangeMusician = (event, index, value) => {
    this.setState({numMusicians : value})
  };


  render() {
    let musicianRow = []
    let numMusicians = this.state.numMusicians
    for(let i = 0; i < numMusicians; i++){
      musicianRow.push(<MusicianRow key={i}/>)
    }
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
          <div className="card1">
            <h2 className="smallHeading">My Cast</h2>
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
          <div className="card1">
            <h2 className="smallHeading">Information Sheet</h2>
            <div className="choreoContact">
              <p>Choreographer's Name: [display here]</p>
              <p>Choreographer's Phone Number:</p>
                <TextField 
                  id="phoneNumber"
                  onChange={this.handleChange('phoneNumber')}
                  style={STYLES}
                />
              
              <p>Choreographer's email: [display choreographers email here]</p>
            </div>
            <div className="dancerInfo">
              <p>Number of dancers: [display num dancers]</p>
              <p>Dancer Contact Information: [list of dancers and emails]</p> 
            </div>
            <div className="pieceInfo">
              <p>Dance Title: </p>
                <TextField 
                  id="danceTitle"
                  onChange={this.handleChange('danceTitle')}
                  style={STYLES}
                />
              <p>Dance RunTime:</p>
                <TextField 
                  id="runtime"
                  onChange={this.handleChange('runtime')}
                  style={STYLES}
                />
              
              <p>Composer(s):</p>
                <TextField 
                  id="composer"
                  onChange={this.handleChange('composer')}
                  style={STYLES}
                />
              
              <p>Music title(s): </p>
                <TextField 
                  id="musicTitle"
                  onChange={this.handleChange('musicTitle')}
                  style={STYLES}
                />
              
              <p>Performed By:</p>
                <TextField 
                  id="musicPerformer"
                  onChange={this.handleChange('musicPerformer')}
                  style={STYLES}
                />
              
              <p>Music Source:</p>
                <TextField 
                  id="musicSource"
                  onChange={this.handleChange('musicSource')}
                  style={STYLES}
                />
              
              <p>If music will be performed live, number of musicians:  </p> 
              <SelectField
                value={this.state.numMusicians}
                onChange={this.handleChangeMusician}
              >
                <MenuItem value={0} primaryText="0" />
                <MenuItem value={1} primaryText="1" />
                <MenuItem value={2} primaryText="2" />
                <MenuItem value={3} primaryText="3" />
                <MenuItem value={4} primaryText="4" />
                <MenuItem value={5} primaryText="5" />
                <MenuItem value={6} primaryText="6" />
                <MenuItem value={7} primaryText="7" />
                <MenuItem value={8} primaryText="8" />
                <MenuItem value={9} primaryText="9" />
                <MenuItem value={10} primaryText="10+" />
              </SelectField>
              
              {
                this.state.numMusicians > 0 &&
                <div className="musicianInfo">
                  <p>List of contact info for musicians: </p>
                  {musicianRow}
                </div>
              }
              <p>Rehearsal Schedule: [display rehearsal schedule]</p>
            </div>
            <div className="notes">
              <p>Choreographers Notes: </p>
                <TextField 
                  id="choreoNotes"
                  multiLine={true}
                  onChange={this.handleChange('choreoNotes')}
                  style={STYLES}
                />
              
              <p>Costume Descriptions:  </p>
                <TextField 
                  id="costumeDesc"
                  multiLine={true}
                  onChange={this.handleChange('costumeDesc')}
                  style={STYLES}
                />
             
              <p>Props/Scenic Items Descriptions: </p>
                <TextField 
                  id="propsDesc"
                  multiLine={true}
                  onChange={this.handleChange('propsDesc')}
                  style={STYLES}
                />
              
              <p>Lighting Description: </p>
                <TextField 
                  id="lightingDesc"
                  multiLine={true}
                  onChange={this.handleChange('lightingDesc')}
                  style={STYLES}
                />
              
              <p>Other special needs:  </p>
                <TextField 
                  id="otherDesc"
                  multiLine={true}
                  onChange={this.handleChange('otherDesc')}
                  style={STYLES}
                />
             
            </div>
          </div>
        </div>
      </section>
  );
};

}
export default Piece;

