import React, { Component } from 'react';

import AllDancersRow from './AllDancersRow';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class ResolveConflict extends Component {

  render() {
    console.log(this.props)
    let yourCast = []
    const cast = this.props.cast
    if(cast){
      yourCast = cast.map(dancer => {
        return (
          <AllDancersRow key={dancer.dancer.user.id} person={dancer.dancer.user} regNum={dancer.dancer.regNum} resolveYourCast={true} audition={this.props.audition}/>
        )
      })
    }

    let allDancers = []
    const uncast = this.props.uncast
    if(uncast) {
      allDancers = uncast.map(person => {
        return (
          <AllDancersRow key={person.user.id} person={person.user} regNum={person.regNum} resolveNotYourCast={true} audition={this.props.audition} />
        )
      })
    }

    let conflictsRow = []
    const conflicts = this.props.contested
    console.log(this.props.contested)
    if(conflicts) {
      conflictsRow = conflicts.map(conflict => {
        return (
          <AllDancersRow choreographers={conflict.choreographers} key={conflict.rankedDancer.dancer.userid} person={conflict.rankedDancer.dancer.user} numPieces={conflict.rankedDancer.dancer.numShows} rank={conflict.rankedDancer.rank} audition={this.props.audition} resolveConflict={true}/>
        )
      })
    }

    return (
      <section>
        <div className="mainView">
          <div className="card1">
            <div className="wrap">
              <div className="conflictsCard">
                <h2 className="conflictMessage">Conflicts of interest between you and other choreographers.</h2> 
              <table>
                  <tbody>
                    <tr className="categories">
                      <th></th>
                      <th>#</th>
                      <th>Dancer</th>
                      <th>Pieces</th>
                      <th className="dancerRank">Rank</th>
                      <th>Choreographers</th>
                      <th></th>
                    </tr>
                    {conflictsRow}
                  </tbody>
                </table>
                </div>
            </div>
          </div>
          
          <div className="transparentCard">
          <div className="wrap">
            <div className="castList-v2 cardAddMargin">
              <div className="choreographersSelecteCast">
                <h2 className="smallHeading"> Your cast </h2>
                <table>
                  <tbody>
                    <tr className="categories">
                      <th></th>
                      <th>#</th>
                      <th>Dancer</th>
                      <th></th>
                    </tr>
                    {yourCast}
                  </tbody>
                </table>
              </div>
              </div>
              <div className="castList-v2">
              <div className="restOfCast">
                <h2 className="smallHeading"> All dancers </h2>
                <table>
                  <tbody>
                    <tr className="categories">
                      <th></th>
                      <th>#</th>
                      <th>Dancer</th>
                      <th></th>
                    </tr>
                    {allDancers}
                  </tbody>
                </table>
              </div>
            </div>
        </div>
        </div>
        </div>
      </section>
    );
  };

}
export default ResolveConflict;