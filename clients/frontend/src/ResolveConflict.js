import React, { Component } from 'react';

import CastDancersRow from './CastDancersRow';
import ConflictRow from './ConflictRow';
import './styling/General.css';
import './styling/CastingFlow.css';

class ResolveConflict extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cast: JSON.parse(localStorage.getItem("cast")),
      dancers: JSON.parse(localStorage.getItem("allUsers"))
    }
  };


  render() {
    //console.log(dancers)
    //const cast = JSON.parse(localStorage.getItem("cast"))
    const cast = JSON.parse(localStorage.socketCast)
    let yourCast = cast.map(dancer => {
      return (
        <CastDancersRow key={dancer.dancer.user.id} person={dancer.dancer.user} filter={false} updateCast={() => { this.setState({ cast: JSON.parse(localStorage.getItem("cast")) }) }} />
      )
    })

    const dancers = JSON.parse(localStorage.uncasted)
    let allDancers = dancers.map(person => {
      return (
        //only return a row for dancers that are not in the cast
        <CastDancersRow key={person.user.id} person={person.user} filter={false} uncast={true} updateCast={() => { this.setState({ dancers: JSON.parse(localStorage.getItem("allUsers")) }) }} />
      )
    })

    const conflicts = JSON.parse(localStorage.contested)
    let conflictsRow = conflicts.map(conflict => {
      return (
        <ConflictRow choreographers = {conflict.choreographers} dancer = {conflict.rankedDancer.dancer} rank={conflict.rankedDancer.rank}/>
      )
    })

    return (
      <section>
        <div className="mainView">
          <div className="card1">
            <div className="wrap">
              {/*STYLING these h1s should definitely be h2s so we can have an accurate HTML tree, putting as h1 temporarily*/}
              <div className="conflictsCard">
                <h2 className="conflictMessage">Conflicts of interest between you and other choreographers.</h2>
                
              </div>
              <table>
                  <tbody>
                    <tr className="categories">
                      <th></th>
                      <th>#</th>
                      <th>Dancer</th>
                      <th>Pieces</th>
                      <th>Rank</th>
                      <th>Choreographers</th>
                      <th></th>
                    </tr>
                    {conflictsRow}
                  </tbody>
                </table>

            </div>
          </div>
          
          <div className="transparentCard">
          <div className="wrap">
            <div className="castList-v2">
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
              <div className="castList-v2-1">
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