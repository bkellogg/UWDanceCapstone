import React, { Component } from 'react';
import * as Util from './util.js';
import BigCalendar from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Button from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MusicianRow from './MusicianRow';
import PersonRow from './PersonRow';
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
      numMusicians: 0,
      choreographer: {},
      dancers: [],
      openInfo: false,
      openCast: false,
      openCalendar: false
    }
  };

  componentWillMount(){
    //get info about everyone in the piece
    this.getPieceUsers()
  }

  getPieceUsers = () => {
    //hardcoded piece id as "1", will eventually get piece ID from somewhere else
    //TODO deal with pages
    Util.makeRequest("pieces/1/users", "", "GET", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(piece => {
      this.setState({
        choreographer : piece.choreographer,
        dancers : piece.dancers
      })
    })
  }

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

  toggleInfo = () => {
    let opp = this.state.openInfo
    this.setState({
      openInfo: !opp
    })
  }

  toggleCast = () => {
    let opp = this.state.openCast
    this.setState({
      openCast : !opp
    })
  }

  toggleCalendar = () => {
    let opp = this.state.openCalendar
    this.setState({
      openCalendar : !opp
    })
  }



  render() {
    let musicianRow = []
    let numMusicians = this.state.numMusicians
    for(let i = 0; i < numMusicians; i++){
      musicianRow.push(<MusicianRow key={i}/>)
    }
    
    let castRows = this.state.dancers.map((dancer, i) => {
      return (<PersonRow p={dancer} piece={true} key={i}/>)
    })

    let contactRows = this.state.dancers.map((dancer, i) => {
      return (
        <tr key={i}>
          <td>
            {dancer.firstName + " " + dancer.lastName}
          </td>
          <td>
            {dancer.email}
          </td>  
        </tr>  
      )
    })

    return (
      <section className="main">
        <div className="mainView">
          <h1>My Piece</h1>
          <div className="card1">
            {
              !this.state.openCalendar &&
              // Styling for toggle header is in general
              <div className="toggleHeader">
                <h2 className="smallHeading">Calendar</h2>
                <i className="fas fa-chevron-down fa-lg" onClick={this.toggleCalendar}></i>
              </div>
            } 
            {
              this.state.openCalendar &&
              <section>
                <div className="toggleHeader">
                  <h2 className="smallHeading">Calendar</h2>
                  <i className="fas fa-chevron-up fa-lg" onClick={this.toggleCalendar}></i>
                </div>
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
              </section>
            }
          </div>
          <div className="card1">
          {
            !this.state.openCast &&
            // Styling for toggle header is in general
            <div className="toggleHeader">
              <h2 className="smallHeading">My Cast</h2>
              <i className="fas fa-chevron-down fa-lg" onClick={this.toggleCast}></i>
            </div>
          }
          {
            this.state.openCast &&
            <section>
              <div className="toggleHeader">
                <h2 className="smallHeading">My Cast</h2>
                <i className="fas fa-chevron-up fa-lg" onClick={this.toggleCast}></i>
              </div>
              <table>
              <tbody>
                <tr className="categories">
                  <th className="avatar2">Photo</th>
                  <th>Name</th>
                  <th className="userRoleDisp">Bio</th>
                  <th>Email</th>
                </tr>
                {castRows}
              </tbody>
            </table>
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
            </section>
          } 
          </div>
          <div className="card1">
            {
              !this.state.openInfo &&
              <div className="toggleHeader">
                <h2 className="smallHeading">Information Sheet</h2>
                <i className="fas fa-chevron-down fa-lg" onClick={this.toggleInfo}></i>
              </div>
            }
            {
              this.state.openInfo &&
              <section>
                <div className="toggleHeader">
                  <h2 className="smallHeading">Information Sheet</h2>
                  <i className="fas fa-chevron-up fa-lg" onClick={this.toggleInfo}></i>
                </div>
                <div className="choreoContact">
                  <p>Choreographer's Name: {this.state.choreographer.firstName + " " + this.state.choreographer.lastName} </p>
                  <p>Choreographer's Phone Number:</p>
                    <TextField 
                      id="phoneNumber"
                      onChange={this.handleChange('phoneNumber')}
                      style={STYLES}
                    />
                  
                  <p>Choreographer's email: {this.state.choreographer.email}</p>
                </div>
                <div className="dancerInfo">
                  <p>Number of dancers: {this.state.dancers.length}</p>
                  <p>Dancer Contact Information:</p> 
                  <table>
                    <tbody>
                      <tr className="categories">
                        <th>Name</th>
                        <th>Email</th>
                      </tr>
                      {contactRows}
                    </tbody>
                  </table>
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
                  <p>Rehearsal Schedule:</p>
                  <TextField 
                      id="rehearsalSchedule"
                      onChange={this.handleChange('rehearsalSchedule')}
                      style={STYLES}
                    />
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
                <Button>Save Info Sheet</Button>
              </section>
            }
          </div>
        </div>
      </section>
  );
};

}
export default Piece;

