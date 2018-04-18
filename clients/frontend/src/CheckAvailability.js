import React, { Component } from 'react';
import AvailabilityPersonRow from './AvailabilityPersonRow'

import Avatar from 'material-ui/Avatar';

class CheckAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cast : JSON.parse(localStorage.getItem("cast"))
    }
  };



  render() {
    console.log(this.state.cast)
    let rows = this.state.cast.map(dancer => {
        return(
          <AvailabilityPersonRow key={dancer.id} person={dancer} />
        )
      })

    return (
      <section className="main">
        <div className="mainView">
          <h1>Check Availabliity</h1>
          <div className="castList">
            <p> Filter by dancer </p>
            <table>
              <tbody>
              <tr className="categories">
              <th>Filter</th>
              <th>Photo</th>
              <th>RegNum</th>
              <th>Name</th>
              <th></th>
            </tr>
            {rows}
              </tbody>
            </table>
          </div>
          <div className="overlapAvailability">
          </div>
        </div>
      </section>
  );
};

}
export default CheckAvailability;