import React, { Component } from 'react';
import * as Util from './util.js';
import Button from 'react-materialize/lib/Button';
import TextField from 'material-ui/TextField';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import MusicianRow from './MusicianRow';
import Calendar from './Calendar';
import PersonRow from './PersonRow';
import AvailabilityOverlap from './AvailabilityOverlap';
import SearchUsers from './SearchUsers';
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
      setError: false,
      dancerAvailabilityList: [],
      filteredCast: []
    }
  };

  componentWillMount() {
    //get info about everyone in the piece
    this.getPieceID()
    this.getAuditionID()
  }

  getPieceID = () => {
    Util.makeRequest("users/me/shows/" + this.props.show + "/choreographer", "", "GET", true)
      .then(res => {
        if (res.ok) {
          return res.json()
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
        this.getMusicians(piece.id)
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
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
      console.log(res)
      this.setState({
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
    this.setState({
      setError: false,
      setSuccess: false
    })
    let body = {
      "choreographerPhone": this.state.choreographerPhone,
      "title": this.state.danceTitle,
      "runtime": this.state.runtime,
      "composers": this.state.composer,
      "musicTitle": this.state.musicTitle,
      "performedBy": this.state.musicPerformer,
      "musicSource": this.state.musicSource,
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
      if (res.status === "404") {
        return
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
      this.setState({
        setSuccess : true
      })
    })
    .catch((err) => {
      this.setState({
        setError: err
      })
      console.error(err)
    })
  }

  updateInfoSheet = () => {
    this.setState({
      setError: false,
      setSuccess: false
    })
    let body = {
      "choreographerPhone": this.state.choreographerPhone,
      "title": this.state.danceTitle,
      "runtime": this.state.runtime,
      "composers": this.state.composer,
      "musicTitle": this.state.musicTitle,
      "performedBy": this.state.musicPerformer,
      "musicSource": this.state.musicSource,
      "rehearsalSchedule": this.state.rehearsalSchedule,
      "chorNotes": this.state.choreoNotes,
      "musicians": this.state.musicians,
      "costumeDesc": this.state.costumeDesc,
      "itemDesc": this.state.propsDesc,
      "lightingDesc": this.state.lightingDesc,
      "otherNotes": this.state.otherDesc
    }

    Util.makeRequest("pieces/" + this.state.pieceID + "/info", body, "PATCH", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      if (res.status === 404) {
        return
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
      this.setState({
        setSuccess : true
      })
    })
    .catch((err) => {
      this.setState({
        setError: err
      })
      console.error(err)
    })
  }

  getAuditionID = () => {
    Util.makeRequest("shows/" + this.props.show + "/audition", {}, "GET", true)
    .then(res => {
      if (res.ok) {
        return res.json()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(audition => {
      this.setState({
        auditionID : audition.id
      })
    })
    .catch((err) => {
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
  }

  setMusicians = () => {
    let body = {}
    Util.makeRequest("pieces/" + this.state.pieceID + "/musicians", body, "POST", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
  }

  updateMusician = (musicianID) => {
    let body = {}
    Util.makeRequest("pieces/" + this.state.pieceID + "/musicians" + musicianID, body, "PATCH", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
  }

  getMusicians = (pieceID) => {
    Util.makeRequest("pieces/" + pieceID + "/musicians", {}, "GET", true)
    .then(res => {
      if (res.ok) {
        return res.text()
      }
      return res
        .text()
        .then((t) => Promise.reject(t));
    })
    .then(res => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
  }


  async getDancerAvailability() {
    let dancers = this.state.dancers
    let filteredCast=[]

    const allDancersAvailability = dancers.map(async dancer => {
      let dancerAvailability = {
        dancer : {
          user : dancer,
          availability: []
        }
      }
      const response = await Util.makeRequest("users/" + dancer.id + "/auditions/" + this.state.auditionID + "/availability", {}, "GET", true)
      const res = await response

      if (res.ok) {
        let availability = await response.json()
        dancerAvailability.dancer.availability = availability
        filteredCast.push(dancer.id)
        return dancerAvailability
      } else {
        filteredCast.push(dancer.id)
        return dancerAvailability
      }

    })

    const allDancers = await Promise.all(allDancersAvailability)
    this.setState({
      dancerAvailabilityList : allDancers,
      filteredCast: filteredCast
    })
  }


  viewAvailability = () => {
    let view = this.state.viewAvailability
    if (!view) {
      this.getDancerAvailability()
    }
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
      setError: false,
      setSuccess: false,
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
    const dancers = this.state.dancers
    musicianRow = musicians.map((musician, i) => {
      return (
        <MusicianRow key={i} id={i} musicianContact={this.updateMusicianList} musician={musician}/>
      )
    })

    for (let i = 0; i < numMusicians - musicians.length; i++) {
      musicianRow.push(<MusicianRow key={i + "empty"} id={i} musicianContact={this.updateMusicianList} musician={{name:"", phone:"", email:""}}/>)
    }

    let castRows = dancers.map((dancer, i) => {
      return (<PersonRow p={dancer} piece={true} key={i} pieceID={this.state.pieceID} updateCast={() => {this.getPieceUsers(this.state.pieceID)}}/>)
    })

    let contactRows = []
    let numDancers = 0
    dancers.forEach((dancer, i) => {
      if(dancer.role.displayName === "Dancer") {
        numDancers++
        contactRows.push(
          <tr key={i}>
            <td>
              {dancer.firstName + " " + dancer.lastName}
            </td>
            <td>
              {dancer.email}
            </td>
          </tr>
        ) 
      }
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
                <section>
                  <div className="toggleHeader" onClick={this.toggleCalendar}>
                    <h2 className="smallHeading">Calendar 
                      <div className="xtraInfo tooltip pieceTip">
                        <i className="fas fa-question-circle"></i>
                        <span className="tooltiptext">Add rehearsals by <b className="emphasis">clicking & dragging</b> on the calendar. Select events by <b className="emphasis">clicking</b> on the rehearsal name. </span>
                      </div>
                    </h2>
                    <i className="fas fa-chevron-down fa-lg"></i>
                  </div>
                </section>
              }
              {
                this.state.openCalendar &&
                <section>
                  <div className="toggleHeader clickable" onClick={this.toggleCalendar}>
                    <h2 className="smallHeading">Calendar
                      <div className="xtraInfo tooltip pieceTip">
                        <i className="fas fa-question-circle"></i>
                        <span className="tooltiptext">Add rehearsals by <b className="emphasis">clicking & dragging</b> on the calendar. Select events by <b className="emphasis">clicking</b> on the rehearsal name. </span>
                      </div>
                    </h2>
                    <i className="fas fa-chevron-up fa-lg"></i>
                  </div>
                  <p>Access the full tech schedule here: <a href="http://staff.washington.edu/peterb5/Prod%20Shed/ProdScheds.html" target="_blank" rel="noopener noreferrer">UW Dance Production Site</a></p>
                  <Calendar pieceID={this.state.pieceID}/>
                </section>
              }
            </div>
            <div className="fullWidthCard">
              {
                !this.state.openCast &&
                <section>
                  <div className="toggleHeader clickable" onClick={this.toggleCast}>
                    <h2 className="smallHeading">My Cast
                      <div className="xtraInfo tooltip pieceTip">
                        <i className="fas fa-question-circle"></i>
                        <span className="tooltiptext">You can <b className="emphasis">add</b> collaborators to your cast, <b className="emphasis">drop</b> people, and view <b className="emphasis">cast availability</b></span>
                      </div>
                    </h2>
                    <i className="fas fa-chevron-down fa-lg"></i>
                  </div>
                </section>
              }
              {
                this.state.openCast &&
                <section>
                  <div className="toggleHeader clickable" onClick={this.toggleCast}>
                    <h2 className="smallHeading">
                      My Cast
                      <div className="xtraInfo tooltip pieceTip">
                        <i className="fas fa-question-circle"></i>
                        <span className="tooltiptext">You can <b className="emphasis">add</b> collaborators to your cast, <b className="emphasis">drop</b> people, and view <b className="emphasis">cast availability</b></span>
                      </div>
                    </h2>
                    <i className="fas fa-chevron-up fa-lg"></i>
                  </div>
                  <div className="peopleList">
                    <table>
                      <tbody>
                        <tr className="categories">
                          <th>Name</th>
                          <th className= "userRole">Role</th>
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
                      <section>
                      <div className="dividerDiv"></div>
                        <div className="toggleHeader clickable" onClick={this.viewAvailability}>
                          <h2 className="smallHeading subsectionheader" style={{marginBottom: "15px"}}>
                            View Cast Availability
                            <div className="xtraInfo tooltip pieceTip">
                              <i className="fas fa-question-circle"></i>
                              <span className="tooltiptext">You can use your dancers availability to schedule extra rehearsals or new weekly rehearsals when the quarter changes.</span>
                            </div>
                          </h2>
                          <i className="fas fa-chevron-down fa-lg"></i>
                        </div>
                      </section>
                    }
                    {
                      this.state.viewAvailability &&
                      <section>
                        <div className="dividerDiv"></div>
                        <div className="toggleHeader clickable" onClick={this.viewAvailability}>
                          <h2 className="smallHeading subsectionheader">
                            Hide Cast Availability
                            <div className="xtraInfo tooltip pieceTip">
                              <i className="fas fa-question-circle"></i>
                              <span className="tooltiptext">You can use your dancers availability to schedule extra rehearsals or new weekly rehearsals when the quarter changes.</span>
                            </div>
                          </h2>
                          <i className="fas fa-chevron-up fa-lg"></i>
                        </div>
                        <AvailabilityOverlap filteredCast={this.state.filteredCast} cast={this.state.dancerAvailabilityList} contested={[]} />
                      </section>
                    }
                    {
                      !this.state.searchUsers &&
                      <section>
                        <div className="dividerDiv"></div>
                        <div className="toggleHeader clickable subsectionheader" onClick={() => this.setState({searchUsers : true})}>
                          <h2 className="smallHeading">
                            Add Collaborators
                            <div className="xtraInfo tooltip pieceTip">
                            <i className="fas fa-question-circle"></i>
                            <span className="tooltiptext">You <b className="emphasis">search</b> for users and <b className="emphasis">add</b> them to your cast here.</span>
                          </div>
                          </h2>
                          <i className="fas fa-chevron-down fa-lg"></i>
                        </div>
                      </section>
                    }
                    {
                      this.state.searchUsers &&
                      <section>
                        <div className="dividerDiv"></div>
                        <div className="toggleHeader clickable" onClick={() => this.setState({searchUsers : false})}>
                          <h2 className="smallHeading subsectionheader">
                            Add Collaborators
                            <div className="xtraInfo tooltip pieceTip">
                              <i className="fas fa-question-circle"></i>
                              <span className="tooltiptext">You <b className="emphasis">search</b> for users and <b className="emphasis">add</b> them to your cast here.</span>
                            </div>
                          </h2>
                          <i className="fas fa-chevron-up fa-lg"></i>
                        </div>
                        <SearchUsers pieceID={this.state.pieceID} addedUser={() => this.getPieceUsers(this.state.pieceID)}/>
                      </section>
                    }
                  </div>
                </section>
              }
            </div>
            <div className="fullWidthCard">
              {
                !this.state.openInfo &&
                <section>
                  <div className="toggleHeader clickable" onClick={this.toggleInfo}>
                    <h2 className="smallHeading">
                      Information Sheet
                      <div className="xtraInfo tooltip pieceTip">
                        <i className="fas fa-question-circle"></i>
                        <span className="tooltiptext">Fill out this info sheet with <b className="emphasis">piece details</b>. Some information has been auto-filled for you.</span>
                      </div>
                    </h2>
                    <i className="fas fa-chevron-down fa-lg"></i>
                  </div>
                </section>
              }
              {
                this.state.openInfo &&
                <section>
                  <div className="toggleHeader clickable" onClick={this.toggleInfo}>
                    <h2 className="smallHeading">
                      Information Sheet
                      <div className="xtraInfo tooltip pieceTip">
                        <i className="fas fa-question-circle"></i>
                        <span className="tooltiptext">Fill out this info sheet with <b className="emphasis">piece details</b>. Some information has been auto-filled for you.</span>
                      </div>
                    </h2>
                    <i className="fas fa-chevron-up fa-lg"></i>
                  </div>
                  <div className="peopleList">
                    <div className="choreoContact">
                      <p><b>Choreographer's Name:</b> {this.state.choreographer.firstName + " " + this.state.choreographer.lastName} </p>
                      <p><b>Choreographer's Phone Number:</b></p>
                      <TextField
                        className="textField"
                        id="choreographerPhone"
                        defaultValue={this.state.choreographerPhone}
                        onChange={this.handleChange('choreographerPhone')}
                        style={STYLES}
                      />

                      <p><b>Choreographer's email:</b> {this.state.choreographer.email}</p>
                    </div>
                    <div className="dancerInfo">
                      <p><b>Number of dancers: </b>{numDancers}</p>
                      <p><b>Dancer Contact Information:</b></p>
                      { 
                        numDancers > 0 &&
                          <table>
                            <tbody>
                              <tr className="categories">
                                <th>Name</th>
                                <th>Email</th>
                              </tr>
                              {contactRows}
                            </tbody>
                          </table>
                      }
                      {
                        numDancers === 0 &&
                        <p>No dancers in the cast.</p>
                      }
                    </div>
                    <div className="pieceInfo">
                      <p><b>Dance Title: </b></p>
                      <TextField
                        className="textField"
                        id="danceTitle"
                        defaultValue={this.state.danceTitle}
                        onChange={this.handleChange('danceTitle')}
                        style={STYLES}
                      />
                      <p><b>Dance Runtime:</b></p>
                      <TextField
                        className="textField"
                        id="runtime"
                        defaultValue={this.state.runtime}
                        onChange={this.handleChange('runtime')}
                        style={STYLES}
                      />

                      <p><b>Composer(s):</b></p>
                      <TextField
                        className="textField"
                        id="composer"
                        multiLine={true}
                        defaultValue={this.state.composer}
                        onChange={this.handleChange('composer')}
                        style={STYLES}
                      />

                      <p><b>Music title(s): </b></p>
                      <TextField
                        className="textField"
                        id="musicTitle"
                        multiLine={true}
                        defaultValue={this.state.musicTitle}
                        onChange={this.handleChange('musicTitle')}
                        style={STYLES}
                      />

                      <p><b>Performed By:</b></p>
                      <TextField
                      className="textField"
                        id="musicPerformer"
                        defaultValue={this.state.musicPerformer}
                        onChange={this.handleChange('musicPerformer')}
                        style={STYLES}
                      />

                      <p><b>Music Source:</b></p>
                      <TextField
                        className="textField"
                        id="musicSource"
                        defaultValue={this.state.musicSource}
                        onChange={this.handleChange('musicSource')}
                        style={STYLES}
                      />

                      <p><b>If music will be performed live, number of musicians: </b> </p>
                      <SelectField
                        style={{backgroundColor: 'white', border: '1px solid lightgray', borderRadius: '5px', width: '90px', paddingLeft: '10px'}}
                        defaultValue={numMusicians}
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
                        numMusicians > 0 &&
                        <div className="musicianInfo">
                          <p><b>List of contact info for musicians:</b> </p>
                          {musicianRow}
                        </div>
                      }
                      <p><b>Rehearsal Schedule:</b></p>
                      <TextField
                        className="textField"
                        id="rehearsalSchedule"
                        defaultValue={this.state.rehearsalSchedule}
                        multiLine={true}
                        onChange={this.handleChange('rehearsalSchedule')}
                        style={STYLES}
                      />
                    </div>
                    <div className="notes">
                      <p><b>Choreographers Notes:</b> </p>
                      <TextField
                        className="textField"
                        id="choreoNotes"
                        defaultValue={this.state.choreoNotes}
                        multiLine={true}
                        onChange={this.handleChange('choreoNotes')}
                        style={STYLES}
                      />

                      <p><b>Costume Descriptions: </b> </p>
                      <TextField
                        className="textField"
                        id="costumeDesc"
                        defaultValue={this.state.costumeDesc}
                        multiLine={true}
                        onChange={this.handleChange('costumeDesc')}
                        style={STYLES}
                      />

                      <p><b>Props/Scenic Items Descriptions:</b> </p>
                      <TextField
                        className="textField"
                        id="propsDesc"
                        defaultValue={this.state.propsDesc}
                        multiLine={true}
                        onChange={this.handleChange('propsDesc')}
                        style={STYLES}
                      />

                      <p><b>Lighting Description: </b></p>
                      <TextField
                        className="textField"
                        id="lightingDesc"
                        defaultValue={this.state.lightingDesc}
                        multiLine={true}
                        onChange={this.handleChange('lightingDesc')}
                        style={STYLES}
                      />

                      <p><b>Other special needs: </b> </p>
                      <TextField
                        className="textField"
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
                      onClick={this.updateInfoSheet}>
                      Save</Button>

                      <Button 
                      className="saveButton" 
                      onClick={() => this.setState({setError: false, setSuccess: false, openInfo: false})}>
                      Cancel</Button>

                      {
                        this.state.setError &&
                        <div className="serverError">
                          Error setting piece info sheet: {Util.titleCase(this.state.setError)}
                        </div>
                      }
                      {
                        this.state.setSuccess &&
                        <div className="successPiece">
                          Info Sheet Updated
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

