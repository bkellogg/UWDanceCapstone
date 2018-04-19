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
      numRehearsals: 2,
      open: false,
      rehearsalSchedule: []
    }
  };

  postCasting = () => {
    console.log("post")
    this.setState({ open: false });
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


  render() {
    let numRehearsals = this.state.numRehearsals
    let rehearsals = []
    for (let i = 0; i < numRehearsals; i++) {
      rehearsals.push(<RehearsalRow key={i} />)
    }
    return (
      <section >
        <div className="mainView">
          <div className="transparentCard">
            <div className="wrap">
              <div className="castList setTimesWrap">
              <div class="extraClass">
                <div className="setTimes">
                
                  <h2 className="smallHeading">Set Weekly Rehearsal Times</h2> {/*I think it's important to specify weekly rehearsals - they can set the tech/dress schedule late (from My Piece?)*/}
                  {rehearsals}
                  
                  <div className="buttonsWrap">
                  <Button 
                  backgroundColor="#708090"
                  style={{color: '#ffffff', float: 'right'}}
                  onClick={this.addRehearsal}>
                  ADD</Button>
                  
                  <Button 
                  backgroundColor="#708090"
                  style={{color: '#ffffff', marginRight: '20px', float: 'right'}}
                  onClick={this.removeRehearsal}>
                  REMOVE</Button>
                  </div>
                  </div>
                  <div className="postCastingWrap">
                  <div className="postCasting">
                    <Button 
                    backgroundColor="#22A7E0"
                    style={{color: '#ffffff', width:'100%'}}
                    onClick={this.handleOpen}>
                    POST CASTING</Button>
                  </div>
                </div>
                
                </div>

              <div className="overlapAvailability"> stuff go here
                {/*This is where the overlapping availability will be displayed, same style as the one on the availability page, but we're not going to have that up for this*/}
              </div>
              </div>
              {/* AFTER CHOSING TIMES */}
              <Dialog
                title="Confirm Casting"
                actions={[
                  <FlatButton
                    label="Cancel"
                    style={{backgroundColor: '#708090', color: '#ffffff', marginRight: '20px'}}
                    primary={false}
                    onClick={this.handleClose}
                  />,
                  <FlatButton
                    label="Post Casting"
                    style={{backgroundColor: '#22A7E0', color: '#ffffff'}}
                    primary={false}
                    keyboardFocused={true}
                    onClick={this.postCasting}
                  />,
                ]}
                modal={false}
                open={this.state.open}
                onRequestClose={this.handleClose}
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