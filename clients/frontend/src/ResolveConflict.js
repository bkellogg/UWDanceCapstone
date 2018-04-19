import React, { Component } from 'react';

import CastDancersRow from './CastDancersRow';
import AllDancersRow from './AllDancersRow';
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
    const cast = JSON.parse(localStorage.getItem("cast"))
    let yourCast = cast.map(dancer => {
      return (
        <CastDancersRow key={dancer.id} person={dancer} filter={false} updateCast={() => { this.setState({ cast: JSON.parse(localStorage.getItem("cast")) }) }} />
      )
    })
    let allDancers = this.state.dancers.map((person) => {
      let dancerInCast = false
      cast.forEach(dancer => {
        //if the dancer in all is also in cast dancer
        console.log(person.firstName + " id: " + person.id + " dancerID: " + dancer.id)
        if (dancer.id === person.id) {
          dancerInCast = true
        }
      })
      if (!dancerInCast) {
        return (
          //only return a row for dancers that are not in the cast
          <AllDancersRow person={person} key={person.id} rank={person.rank} selectCast={false} updateCast={() => { this.setState({ dancers: JSON.parse(localStorage.getItem("allUsers")) }) }} />
        )
      }
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
              <div className="castList-v2 v2-float">
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