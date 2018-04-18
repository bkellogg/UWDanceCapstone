import React, { Component } from 'react';

import CastDancersRow from './CastDancersRow';
import AllDancersRow from './AllDancersRow';

class ResolveConflict extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cast : JSON.parse(localStorage.getItem("cast")),
      dancers : JSON.parse(localStorage.getItem("allUsers"))
    }
  };

  render() {
    const cast = JSON.parse(localStorage.getItem("cast"))
    let yourCast = cast.map(dancer => {
      return(
        <CastDancersRow key={dancer.id} person={dancer} filter={false} updateCast={() => {this.setState({cast : JSON.parse(localStorage.getItem("cast"))})}}/>
      )
    })
    let allDancers = this.state.dancers.map((person) => {
      let dancerInCast = false
      this.state.cast.forEach(dancer => {
        //if the dancer in all is also in cast dancer
        if(dancer.id === person.id){
          dancerInCast = true
        }
      })
      if(!dancerInCast){
        return(
          //only return a row for dancers that are not in the cast
          <AllDancersRow person={person}  key={person.id} rank={person.rank} selectCast={false} updateCast={() => {this.setState({dancers: JSON.parse(localStorage.getItem("allUsers"))})}}/>
        )
      }
    })
    return (
      <section className="main">
      <div className="mainView">
        <h1>Resolve Conflicts</h1>
        {/*STYLING these h1s should definitely be h2s so we can have an accurate HTML tree, putting as h1 temporarily*/}
          <div className = "conflicts">
            <h1> Conflicts between your cast and other choreographers </h1>
          </div>
          <div className = "cast">
            <h1> Your cast </h1>
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
          <div className = "allUsers">
            <h1> All dancers </h1>
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
      </section>
  );
};

}
export default ResolveConflict;