import React, { Component } from 'react';
import * as Util from './util.js';
// import BigCalendar from 'react-big-calendar';
// import moment from 'moment';
// import 'react-big-calendar/lib/css/react-big-calendar.css';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MusicianRow from './MusicianRow';
import Calendar from './Calendar';
import PersonRow from './PersonRow';
import './styling/Piece.css';
import './styling/General.css';
import Link from 'react-router-dom/Link';

const STYLES = { width: "600px", paddingLeft: "15px" }

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
      openCalendar: false,
      error : false
    }
  };

  componentWillMount() {
    //get info about everyone in the piece
    this.getPieceID()
  }

  //TODO deal with the error that a user has no pieces [there's no bug, but we should probably show a different component if they don't have one]
  getPieceID = () => {
    Util.makeRequest("users/me/shows/" + this.props.show + "/choreographer", "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        if (res.status === 404) {
          this.setState({
            error : true
          })
        }
        return res
          .text()
          .then((t) => Promise.reject(t));
      })
      .then(piece => {
        this.setState({
          pieceID : piece.id
        })
        this.getPieceUsers(piece.id)
      })
      .catch((err) => {
        console.error(err)
      })

  }

  getInfoSheet = () => {

  }

  setInfoSheet = () => {
    let body = {
      "choreographerPhone": this.state.choreographerPhone,
      "title": this.state.danceTitle,
      "runtime": this.state.runtime,
      "composers": this.state.composer,
      "musicTitle": this.state.musicTitle,
      "performedBy": this.state.musicPerformer,
      "musicSource": this.state.musicSource,
      "numMusicians": this.state.numMusicians,
      "rehearsalSchedule": this.state.rehearsalSchedule,
      "chorNotes": this.state.choreoNotes,
      "musicians": [
        {
          "name": "Nathan Swanson",
          "phone": "(206) 786-9826",
          "email": "swag@leet.com"
        },
        {
          "name": "Bill Clinton",
          "phone": "291 876 9180",
          "email": "leet@swag.com"
        }
      ],
      "costumeDesc": this.state.costumeDesc,
      "itemDesc": this.state.propsDesc,
      "lightingDesc": this.state.lightingDesc,
      "otherNotes": this.state.otherDesc
    }
  }

  getPieceUsers = (pieceID) => {
    //TODO deal with pages
    Util.makeRequest("pieces/" + pieceID + "/users", "", "GET", true)
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
          choreographer: piece.choreographer,
          dancers: piece.dancers
        })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  viewAvailability = () => {
    let view = this.state.viewAvailability
    this.setState({
      viewAvailability: !view
    })
  }

  handleChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  handleChangeMusician = (event, index, value) => {
    this.setState({ numMusicians: value })
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
      openCast: !opp
    })
  }

  toggleCalendar = () => {
    let opp = this.state.openCalendar
    this.setState({
      openCalendar: !opp
    })
  }



  render() {
    let musicianRow = []
    let numMusicians = this.state.numMusicians
    for (let i = 0; i < numMusicians; i++) {
      musicianRow.push(<MusicianRow key={i} />)
    }

    let castRows = this.state.dancers.map((dancer, i) => {
      return (<PersonRow p={dancer} piece={true} key={i} />)
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
          <div className="pageContentWrap">
            <h1>My Piece</h1>

            { this.state.error && 
              <div>
                You don't have a piece yet! Cast some dancers to get started :) 
              </div>
            }
            { !this.state.error && 
            <section>
            <div className="fullWidthCard">
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
                  <Calendar />
                </section>
              }
            </div>
            <div className="fullWidthCard">
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
                  <div className="peopleList">
                    <table>
                      <tbody>
                        <tr className="categories">
                          <th className="avatar2"></th>
                          <th>Name</th>
                          <th className="bioOfUser">Bio</th>
                          <th className="userEmail">Email</th>
                        </tr>
                        {castRows}
                      </tbody>
                    </table>
                  </div>
                  <div className="buttons">
                    {
                      !this.state.viewAvailability &&
                      <FlatButton
                        style={{ color: '#22A7E0', marginRight: '20px'}}
                        onClick={this.viewAvailability}>
                        View Cast Availability </FlatButton>
                    }
                    {
                      this.state.viewAvailability &&
                      <div>
                        <FlatButton
                        style={{ color: '#22A7E0', marginRight: '20px'}}
                        onClick={this.viewAvailability}>
                          Hide Cast Availabiltiy </FlatButton>
                        <p>View availability ay</p>
                      </div>
                    }
                  </div>
                </section>
              }
            </div>
            <div className="fullWidthCard">
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
                  <div className="peopleList">
                    <div className="choreoContact">
                      <p><b>Choreographer's Name:</b> {this.state.choreographer.firstName + " " + this.state.choreographer.lastName} </p>
                      <p><b>Choreographer's Phone Number:</b></p>
                      <TextField
                        id="choreographerPhone"
                        onChange={this.handleChange('choreographerPhone')}
                        style={STYLES}
                      />

                      <p><b>Choreographer's email: {this.state.choreographer.email}</b></p>
                    </div>
                    <div className="dancerInfo">
                      <p><b>Number of dancers: </b>{this.state.dancers.length}</p>
                      <p><b>Dancer Contact Information:</b></p>
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
                      <p><b>Dance Title: </b></p>
                      <TextField
                        id="danceTitle"
                        onChange={this.handleChange('danceTitle')}
                        style={STYLES}
                      />
                      <p><b>Dance RunTime:</b></p>
                      <TextField
                        id="runtime"
                        onChange={this.handleChange('runtime')}
                        style={STYLES}
                      />

                      <p><b>Composer(s):</b></p>
                      <TextField
                        id="composer"
                        onChange={this.handleChange('composer')}
                        style={STYLES}
                      />

                      <p><b>Music title(s): </b></p>
                      <TextField
                        id="musicTitle"
                        onChange={this.handleChange('musicTitle')}
                        style={STYLES}
                      />

                      <p><b>Performed By:</b></p>
                      <TextField
                        id="musicPerformer"
                        onChange={this.handleChange('musicPerformer')}
                        style={STYLES}
                      />

                      <p><b>Music Source:</b></p>
                      <TextField
                        id="musicSource"
                        onChange={this.handleChange('musicSource')}
                        style={STYLES}
                      />

                      <p><b>If music will be performed live, number of musicians: </b> </p>
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
                          <p><b>List of contact info for musicians:</b> </p>
                          {musicianRow}
                        </div>
                      }
                      <p><b>Rehearsal Schedule:</b></p>
                      <TextField
                        id="rehearsalSchedule"
                        onChange={this.handleChange('rehearsalSchedule')}
                        style={STYLES}
                      />
                    </div>
                    <div className="notes">
                      <p><b>Choreographers Notes:</b> </p>
                      <TextField
                        id="choreoNotes"
                        multiLine={true}
                        onChange={this.handleChange('choreoNotes')}
                        style={STYLES}
                      />

                      <p><b>Costume Descriptions: </b> </p>
                      <TextField
                        id="costumeDesc"
                        multiLine={true}
                        onChange={this.handleChange('costumeDesc')}
                        style={STYLES}
                      />

                      <p><b>Props/Scenic Items Descriptions:</b> </p>
                      <TextField
                        id="propsDesc"
                        multiLine={true}
                        onChange={this.handleChange('propsDesc')}
                        style={STYLES}
                      />

                      <p><b>Lighting Description: </b></p>
                      <TextField
                        id="lightingDesc"
                        multiLine={true}
                        onChange={this.handleChange('lightingDesc')}
                        style={STYLES}
                      />

                      <p><b>Other special needs: </b> </p>
                      <TextField
                        id="otherDesc"
                        multiLine={true}
                        onChange={this.handleChange('otherDesc')}
                        style={STYLES}
                      />

                    </div>
                  </div>
                  <FlatButton
                        style={{ color: '#22A7E0', marginRight: '20px'}}
                        >Save Info Sheet</FlatButton>
                </section>
              }
            </div>
            </section>
            }
          </div>
        </div>
      </section>
    );
  };

}
export default Piece;

