import React, { Component } from 'react';

import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


import AllDancersRow from './AllDancersRow';

class SelectCast extends Component {

  render() {
    let castRows=[]
    let uncastRows=[]
    
    const cast = this.props.cast
    const uncast = this.props.uncast
    //check - does the prop exist. if yes, proceed
    if(cast) {
      castRows = cast.map((dancer) => {
        console.log(dancer)
        return(
          <AllDancersRow person={dancer.dancer.user}  key={dancer.dancer.user.id} regNum={dancer.dancer.regNum} numPieces={dancer.dancer.numShows} rank={dancer.rank} selectCast={true} audition={this.props.auditionID}/>
        )
      })
    }
    if(uncast) {
      uncastRows = uncast.map((dancer) => {
        return(
          <AllDancersRow person={dancer.user}  key={dancer.user.id} regNum={dancer.regNum} numPieces={dancer.numShows} rank={dancer.rank} selectCast={true} audition={this.props.auditionID}/>
        )
      })
    }
  
    return (
      
        <section>
          <div className="mainView">
          <div className="card1">
            <table className="table">
            <tbody>
                <tr className="categories">
                <th></th>
                <th>#</th>
                <th>Name</th>
                <th>Pieces</th>
                <th className="personRankBoxes">
                    Rank
                    <br/>
                    <div className="check rank">1</div>
                    <div className="check rank"> 2</div>
                    <div className="check rank"> 3</div>
                </th>
                </tr>
                {castRows}
                {uncastRows}
            </tbody>
            </table>
            </div>
            </div>
        </section>
  );
};

}


export default SelectCast;