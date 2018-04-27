import React, { Component } from 'react';

import AllDancersRow from './AllDancersRow';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class ResolveConflict extends Component {

  componentDidMount(){
    setTimeout(() => {this.orderTable("conflictsTable")}, 300)
    setTimeout(() => {this.orderTable("yourCast")}, 300)
    setTimeout(() => {this.orderTable("allDancersTable")}, 300)
  }

  orderTable = (tableID) => {
    let table, rows, switching, i, x, y, shouldSwitch;
    table = document.getElementById(tableID);
    switching = true;
    while (switching) {
      switching = false;
      rows = table.getElementsByTagName("tr");
      for (i = 1; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[1];
        y = rows[i + 1].getElementsByTagName("td")[1];
        if (x.innerHTML > y.innerHTML) {
          shouldSwitch= true;
          break;
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
      }
    }
  }

  componentDidUpdate(){
    //this.orderTable("conflictsTable")
    //this.orderTable("yourCast")
    //this.orderTable("allDancersTable")
  }

  render() {
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

    if(conflicts) {
      conflictsRow = conflicts.map(conflict => {
        return (
          <AllDancersRow choreographers={conflict.choreographers} key={conflict.rankedDancer.dancer.user.id} person={conflict.rankedDancer.dancer.user} regNum={conflict.rankedDancer.dancer.regNum} numPieces={conflict.rankedDancer.dancer.numShows} rank={conflict.rankedDancer.rank} audition={this.props.audition} resolveConflict={true}/>
        )
      })
    }

    return (
      <section>
        <div className="mainView">
          <div className="card1">
            <div className="wrap">
              <div className="conflictsCard">
                <h2 className="conflictMessage">Conflicts between you and other choreographers.</h2> 
              <table id="conflictsTable">
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
                <table id="yourCast">
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
                <table id="allDancersTable">
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