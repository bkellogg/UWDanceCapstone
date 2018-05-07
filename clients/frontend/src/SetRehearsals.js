import React, { Component } from 'react';
import * as Util from './util';
import Button from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RehearsalRow from './RehearsalRow';
import AvailabilityOverlap from './AvailabilityOverlap';

import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class SetRehearsals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numRehearsals: 2,
      open: false,
      finished: false,
      rehearsalSchedule: [],
      cast: [],
      contested: [],
      filteredCast: []
    }
  };

  componentWillMount(){
    let filteredCast = []
    this.props.cast.map((dancer, i) => {
      filteredCast.push(dancer.dancer.user.id)
      return filteredCast
    })
    this.props.contested.map(dancer => {
      filteredCast.push(dancer.rankedDancer.dancer.user.id)
      return filteredCast
    })
    this.setState({
      filteredCast : filteredCast,
      cast : this.props.cast,
      contested : this.props.contested
    })
  }

  postCasting = () => {
    Util.makeRequest("auditions/" + this.props.audition + "/casting", {}, "POST", true)
    .then((res) => {
      if (res.ok) {
        return res.text()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(() => {
      this.setState({
        open: false,
        finished: true
      });
    })
    .catch(err => {
      console.error(err)
    })
  }

  handleOpen = () => {
    this.setState({ open: true });
  }

  handleClose = () => {
    this.setState({ open: false });
  };

  addRehearsal = () => {
    let newRehearsalNum = this.state.numRehearsals
    newRehearsalNum++
    this.setState({
      numRehearsals: newRehearsalNum,
    })
  }

  removeRehearsal = () => {
    let newRehearsalNum = this.state.numRehearsals
    newRehearsalNum--
    this.setState({
      numRehearsals: newRehearsalNum
    })
  }

  setRehearsal = (rehearsal) => {
    //TODO add handlers to deal with two rehearsals on the same day and also everything every cri
    if (rehearsal.day !== "" && rehearsal.startTime !== "" && rehearsal.endTime !== "") {
      let rehearsals = this.state.rehearsalSchedule
      rehearsals.push(rehearsal)
      this.setState({
        rehearsalSchedule: rehearsals
      })
    }
  }


  render() {
    const finished = this.state.finished
    let numRehearsals = this.state.numRehearsals
    let rehearsals = []
    for (let i = 0; i < numRehearsals; i++) {
      rehearsals.push(<RehearsalRow key={i} setRehearsal={(rehearsal) => this.setRehearsal(rehearsal)} finished={finished} />)
    }

    let rehearsalList = []
    this.state.rehearsalSchedule.forEach((rehearsal, i) => {
      rehearsalList.push(
        <div key={i}> {rehearsal.day} from {rehearsal.startTime} to {rehearsal.endTime}. </div>
      )
    })

    let castList = []

    
    return (
      <section >
        <div className="mainView mainContentView">
          <div className="transparentCard">
            <div className="wrap">
              <div className="castList">
                <div className="extraClass">
                  <div className="setTimes">

                    <h2 className="smallHeading">Set Weekly Rehearsal Times</h2> {/*I think it's important to specify weekly rehearsals - they can set the tech/dress schedule late (from My Piece?)*/}
                    First Rehearsal Date
                    <input type="date" name="rehearsalStartDate" id="rehearsalStartDate" />
                    Weekly Rehearsal Times
                    {rehearsals}
                    <div className="buttonsWrap">
                        <Button
                        backgroundColor="#708090"
                        style={{ color: '#ffffff', marginRight: '20px', float: 'right' }}
                        onClick={this.addRehearsal}
                        disabled={finished}>
                        ADD</Button>

                        <Button
                        backgroundColor="#708090"
                        style={{ color: '#ffffff', float: 'right' }}
                        onClick={this.removeRehearsal} disabled={finished}>
                        REMOVE</Button>
                    </div>
                  </div>
                  <div className="postCastingWrap">
                    <div className="postCasting">
                      <Button
                        backgroundColor="#22A7E0"
                        style={{ color: '#ffffff', width: '100%', height:'50' }}
                        onClick={this.handleOpen}
                        disabled={finished}>
                        POST CASTING</Button>
                    </div>
                  </div>

                </div>

                <div className="overlapAvailability">
                <AvailabilityOverlap cast={this.state.cast} contested={this.state.contested} filteredCast={this.state.filteredCast}/> 
               </div>
              </div>

              <Dialog
                title="Confirm Casting"
                actions={[
                  <FlatButton
                    label="Cancel"
                    style={{ backgroundColor: 'transparent', color: 'hsl(0, 0%, 29%)', marginRight: '20px' }}
                    primary={false}
                    onClick={this.handleClose}
                  />,
                  <FlatButton
                    label="Post Casting"
                    style={{ backgroundColor: '#22A7E0', color: '#ffffff' }}
                    primary={false}
                    keyboardFocused={true}
                    onClick={this.postCasting}
                  />,
                ]}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
                disabled={finished}
              >
                <p className="warningText"> By clicking Post Casting you confirm that your selected cast is <strong className="importantText">accurate</strong>, there are <strong className="importantText">no conflicts</strong> with other choreographers, and that your rehearsal times are :
            <br /> insert rehearsal times here <br />
                  <br /> </p>
                <p className="importantText warningText">An email will be sent to your cast with these times, and they will accept or decline their casting.</p>
              </Dialog>

            </div>
          </div>
        </div>
      </section>
    );
  };

}

export default SetRehearsals;