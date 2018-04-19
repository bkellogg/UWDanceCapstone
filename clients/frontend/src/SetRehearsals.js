import React, { Component } from 'react';
import Button from 'material-ui/RaisedButton';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import RehearsalRow from './RehearsalRow';

import './styling/General.css';
import './styling/CastingFlow.css';

class SetRehearsals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numRehearsals : 2,
      open : false,
      finished: false,
      rehearsalSchedule : []
    }
  };

  postCasting = () => {
    console.log("post")
    this.setState({
      open: false,
      finished: true
    });
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
    //TODO add handlers to deal with two rehearsals on the same day
    if(rehearsal.day !== "" && rehearsal.startTime !== "" && rehearsal.endTime !== ""){
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
      rehearsals.push(<RehearsalRow key={i} setRehearsal={(rehearsal) => this.setRehearsal(rehearsal)}/>)
    }
    
    let rehearsalList = []
    this.state.rehearsalSchedule.forEach( rehearsal => {
      rehearsalList.push(
        <div> {rehearsal.day} from {rehearsal.startTime} to {rehearsal.endTime}. </div>
      )
    })
    return (
      <section >
        <div className="mainView">
          <div className="card1">
            <div className="wrap">
              <div className="setTimes">
                <h2 className="smallHeading">Set Weekly Rehearsal Times</h2> {/*I think it's important to specify weekly rehearsals - they can set the tech/dress schedule late (from My Piece?)*/}
                {rehearsals}
                <Button onClick={this.addRehearsal}>Add Rehearsal</Button>
                <Button onClick={this.removeRehearsal}>Remove Rehearsal</Button>
              </div>
              <div className="postCasting">
                <Button onClick={this.handleOpen}>POST CASTING</Button>
              </div>
              <div className="overlap">
                {/*This is where the overlapping availability will be displayed, same style as the one on the availability page, but we're not going to have that up for this*/}
              </div>
              <Dialog
                title="Confirm Casting"
                actions={[
                  <FlatButton
                    label="Cancel"
                    primary={true}
                    onClick={this.handleClose}
                  />,
                  <FlatButton
                    label="Post Casting"
                    primary={true}
                    keyboardFocused={true}
                    onClick={this.postCasting}
                  />,
                ]}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
              >
                By clicking Post Casting you confirm that your selected cast is <strong>accurate</strong>, there are <strong>no conflicts</strong> with other choreographers, and that your rehearsal times are :<br /> 
                <div>
                  {rehearsalList}
                </div>
                <br />
                <br />
                <strong>An email will be sent to your cast with these times, and they will accept or decline their casting.</strong>
              </Dialog>
            </div>
          </div>
        </div>
      </section>
    );
  };

}

export default SetRehearsals;