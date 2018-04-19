import React, { Component } from 'react';
import CastDancersRow from './CastDancersRow'
import './styling/General.css';
import './styling/CastingFlow.css';

class CheckAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cast : JSON.parse(localStorage.getItem("cast"))
    }
  };



  render() {
    let rows = this.state.cast.map(dancer => {
        return(
          <CastDancersRow key={dancer.id} person={dancer} filter={true}/>
        )
      })

    return (
      <section>
        <div className="mainView">
          <div className="card1">
        <div className="wrap">
          <div className="castList">
            <p> Filter by dancer </p>
            <div className="dancersList-filter">
            <table>
              <tbody>
              <tr>
                <th></th>
                <th></th>
                <th>#</th>
                <th>Dancer</th>
                <th></th>
              </tr>
              {rows}
              </tbody>
            </table>
          </div>
          <div className="overlapAvailability">calendar goes here </div>
          </div>
        </div>
</div>

        </div>
      </section>
  );
};

}
export default CheckAvailability;