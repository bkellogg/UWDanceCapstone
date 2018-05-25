import React, { Component } from 'react';
import * as Util from './util.js';
import Button from 'react-materialize/lib/Button';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MusicianRow from './MusicianRow';
import Calendar from './Calendar';
import PersonRow from './PersonRow';
import './styling/Piece.css';
import './styling/General.css';

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
      error : false,
      choreographerPhone : "",
      danceTitle : "",
      runtime : "",
      composer : "",
      musicTitle : "",
      musicPerformer : "",
      musicSource : "",
      rehearsalSchedule : "",
      choreoNotes : "",
      musicians : [],
      costumeDesc : "",
      propsDesc : "",
      lightingDesc : "",
      otherDesc : "",
      setError: false
    }
  };

  componentWillMount() {
    //get info about everyone in the piece
    this.getPieceID()
  }

  getPieceID = () => {
    Util.makeRequest("users/me/shows/" + this.props.show + "/choreographer", "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        //this is if there is no piece
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
        this.getInfoSheet(piece.id)
      })
      .catch((err) => {
        console.error(err)
      })

  }

  getInfoSheet = (id) => {
    Util.makeRequest("pieces/" + id + "/info", "", "GET", true)
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
    .then(res => {
      this.setState({
        numMusicians: res.numMusicians,
        choreographerPhone : res.choreographerPhone,
        danceTitle : res.title,
        runtime : res.runTime,
        composer : res.composers,
        musicTitle : res.musicTitle,
        musicPerformer : res.performedBy,
        musicSource : res.musicSource,
        rehearsalSchedule : res.rehearsalSchedule,
        choreoNotes : res.chorNotes,
        musicians : res.musicians,
        costumeDesc : res.costumeDesc,
        propsDesc : res.itemDesc,
        lightingDesc : res.lightingDesc,
        otherDesc : res.otherNotes
      })
    })
    .catch((err) => {
      console.error(err)
    })
  }

  //TODO show errors for invalid information (when strings are longer than 0 they must be valid emails orphone numbers)
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
      "musicians": this.state.musicians,
      "costumeDesc": this.state.costumeDesc,
      "itemDesc": this.state.propsDesc,
      "lightingDesc": this.state.lightingDesc,
      "otherNotes": this.state.otherDesc
    }

    Util.makeRequest("pieces/" + this.state.pieceID + "/info", body, "POST", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
        console.log(res)
    })
    .catch((err) => {
      this.setState({
        setError: err
      })
      console.error(err)
    })
  }

  getPieceUsers = (pieceID) => {
    //TODO deal with pages
    for(let i = 1; i <= Util.PAGEMAX; i++) {
      Util.makeRequest("pieces/" + pieceID + "/users?page=" + i, "", "GET", true)
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
          let currDancers = this.state.dancers
          let newDancers = currDancers.concat(piece.dancers)
          this.setState({
            choreographer: piece.choreographer,
            dancers: newDancers
          })
        })
        .catch((err) => {
          console.error(err)
        })
    }
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
    let musicians = this.state.musicians
    musicians = musicians.slice(0, value )
    this.setState({ 
      numMusicians: value,
      musicians : musicians
    })
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

  updateMusicianList = (musician, id) => {
      let musicians = this.state.musicians
      musicians[id] = musician
      this.setState({
        musicians : musicians
      })
  }

  render() {
    let musicianRow = []
    let numMusicians = this.state.numMusicians
    let musicians = this.state.musicians

    musicianRow = musicians.map((musician, i) => {
      return (
        <MusicianRow key={i} id={i} musicianContact={this.updateMusicianList} musician={musician}/>
      )
    })

    for (let i = 0; i < numMusicians - musicians.length; i++) {
      musicianRow.push(<MusicianRow key={i} id={i} musicianContact={this.updateMusicianList} musician={{name:"", phone:"", email:""}}/>)
    }

    let castRows = this.state.dancers.map((dancer, i) => {
      return (<PersonRow p={dancer} piece={true} key={i} pieceID={this.state.pieceID} updateCast={() => {this.setState({dancers: []}); this.getPieceUsers(this.state.pieceID)}}/>)
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

    console.log(this.state.dancers)
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
                <div className="toggleHeader" onClick={this.toggleCalendar}>
                  <h2 className="smallHeading">Calendar</h2>
                  <i className="fas fa-chevron-down fa-lg"></i>
                </div>
              }
              {
                this.state.openCalendar &&
                <section>
                  <div className="toggleHeader" onClick={this.toggleCalendar}>
                    <h2 className="smallHeading">Calendar</h2>
                    <i className="fas fa-chevron-up fa-lg"></i>
                  </div>
                  <p>Access the full tech schedule here: {<a href="http://staff.washington.edu/peterb5/Prod%20Shed/ProdScheds.html">UW Dance Production Site</a>}</p>
                  <Calendar pieceID={this.state.pieceID}/>
                </section>
              }
            </div>
            <div className="fullWidthCard">
              {
                !this.state.openCast &&
                // Styling for toggle header is in general
                <div className="toggleHeader" onClick={this.toggleCast}>
                  <h2 className="smallHeading">My Cast</h2>
                  <i className="fas fa-chevron-down fa-lg"></i>
                </div>
              }
              {
                this.state.openCast &&
                <section>

                  <div className="toggleHeader" onClick={this.toggleCast}>
                    <h2 className="smallHeading">My Cast</h2>
                    <i className="fas fa-chevron-up fa-lg"></i>
                  </div>
                  <div className="peopleList">
                    <table>
                      <tbody>
                        <tr className="categories">
                          <th className="avatar2"></th>
                          <th>Name</th>
                          <th className="bioOfUser">Bio</th>
                          <th className="userEmail">Email</th>
                          <th></th>
                        </tr>
                        {castRows}
                      </tbody>
                    </table>
                  </div>
                  <div className="buttons">
                    {
                      !this.state.viewAvailability &&
                      <div className="toggleHeader" onClick={this.viewAvailability}>
                        <h2 className="smallHeading">View Cast Availability</h2>
                        <i className="fas fa-chevron-down fa-lg"></i>
                      </div>
                    }
                    {
                      this.state.viewAvailability &&
                      <div className="toggleHeader" onClick={this.viewAvailability}>
                        <h2 className="smallHeading">Hide Cast Availability</h2>
                        <i className="fas fa-chevron-up fa-lg"></i>
                      </div>
                    }
                  </div>
                </section>
              }
            </div>
            <div className="fullWidthCard">
              {
                !this.state.openInfo &&
                <div className="toggleHeader" onClick={this.toggleInfo}>
                  <h2 className="smallHeading">Information Sheet</h2>
                  <i className="fas fa-chevron-down fa-lg"></i>
                </div>
              }
              {
                this.state.openInfo &&
                <section>
                  <div className="toggleHeader" onClick={this.toggleInfo}>
                    <h2 className="smallHeading">Information Sheet</h2>
                    <i className="fas fa-chevron-up fa-lg"></i>
                  </div>
                  <div className="peopleList">
                    <div className="choreoContact">
                      <p><b>Choreographer's Name:</b> {this.state.choreographer.firstName + " " + this.state.choreographer.lastName} </p>
                      <p><b>Choreographer's Phone Number:</b></p>
                      <TextField
                        id="choreographerPhone"
                        defaultValue={this.state.choreographerPhone}
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
                        defaultValue={this.state.danceTitle}
                        onChange={this.handleChange('danceTitle')}
                        style={STYLES}
                      />
                      <p><b>Dance Runtime:</b></p>
                      <TextField
                        id="runtime"
                        defaultValue={this.state.runtime}
                        onChange={this.handleChange('runtime')}
                        style={STYLES}
                      />

                      <p><b>Composer(s):</b></p>
                      <TextField
                        id="composer"
                        defaultValue={this.state.composer}
                        onChange={this.handleChange('composer')}
                        style={STYLES}
                      />

                      <p><b>Music title(s): </b></p>
                      <TextField
                        id="musicTitle"
                        defaultValue={this.state.musicTitle}
                        onChange={this.handleChange('musicTitle')}
                        style={STYLES}
                      />

                      <p><b>Performed By:</b></p>
                      <TextField
                        id="musicPerformer"
                        defaultValue={this.state.musicPerformer}
                        onChange={this.handleChange('musicPerformer')}
                        style={STYLES}
                      />

                      <p><b>Music Source:</b></p>
                      <TextField
                        id="musicSource"
                        defaultValue={this.state.musicSource}
                        onChange={this.handleChange('musicSource')}
                        style={STYLES}
                      />

                      <p><b>If music will be performed live, number of musicians: </b> </p>
                      <SelectField
                        defaultValue={this.state.numMusicians}
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
                        defaultValue={this.state.rehearsalSchedule}
                        onChange={this.handleChange('rehearsalSchedule')}
                        style={STYLES}
                      />
                    </div>
                    <div className="notes">
                      <p><b>Choreographers Notes:</b> </p>
                      <TextField
                        id="choreoNotes"
                        defaultValue={this.state.choreoNotes}
                        multiLine={true}
                        onChange={this.handleChange('choreoNotes')}
                        style={STYLES}
                      />

                      <p><b>Costume Descriptions: </b> </p>
                      <TextField
                        id="costumeDesc"
                        defaultValue={this.state.costumeDesc}
                        multiLine={true}
                        onChange={this.handleChange('costumeDesc')}
                        style={STYLES}
                      />

                      <p><b>Props/Scenic Items Descriptions:</b> </p>
                      <TextField
                        id="propsDesc"
                        defaultValue={this.state.propsDesc}
                        multiLine={true}
                        onChange={this.handleChange('propsDesc')}
                        style={STYLES}
                      />

                      <p><b>Lighting Description: </b></p>
                      <TextField
                        id="lightingDesc"
                        defaultValue={this.state.lightingDesc}
                        multiLine={true}
                        onChange={this.handleChange('lightingDesc')}
                        style={STYLES}
                      />

                      <p><b>Other special needs: </b> </p>
                      <TextField
                        id="otherDesc"
                        defaultValue={this.state.otherDesc}
                        multiLine={true}
                        onChange={this.handleChange('otherDesc')}
                        style={STYLES}
                      />

                    </div>
                  </div>

                      <Button 
                      className="saveButton" 
                      onClick={this.setInfoSheet}>
                      Save</Button>

                      {
                        this.state.setError &&
                        <div className="serverError">
                          Error setting piece info sheet: {Util.titleCase(this.state.setError)}
                        </div>
                      }
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

