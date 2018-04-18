import React, { Component } from 'react';
import Button from 'material-ui/RaisedButton';

import RehearsalRow from './RehearsalRow';

class SetRehearsals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      numRehearsals : 2
    }
  };

  postCasting = () => {
    console.log("post")
  }
  
  addRehearsal = () => {
    let newRehearsalNum = this.state.numRehearsals
    newRehearsalNum++
    this.setState({
      numRehearsals: newRehearsalNum,
      rehearsalSchedule: []
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
      rehearsals.push(<RehearsalRow key={i}/>)
     }
    return (
      <section className="main">
        <div className="mainView">
          <h1>Set Rehearsals</h1>
          <div className="setTimes">
            <p>Set Weekly Rehearsal Times</p> {/*I think it's important to specify weekly rehearsals - they can set the tech/dress schedule late (from My Piece?)*/}
            {rehearsals}
            <Button onClick={this.addRehearsal}>Add Rehearsal</Button>
            <Button onClick={this.removeRehearsal}>Remove Rehearsal</Button>
          </div>
          <div className="postCasting">
              <Button onClick={this.postCasting}>POST CASTING</Button>
            </div>
          <div className="overlap">
          {/*This is where the overlapping availability will be displayed, same style as the one on the availability page, but we're not going to have that up for this*/}
          </div>
        </div>
      </section>
  );
};

}

export default SetRehearsals;