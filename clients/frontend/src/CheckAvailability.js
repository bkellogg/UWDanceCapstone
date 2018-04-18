import React, { Component } from 'react';
import CastDancersRow from './CastDancersRow'

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
      <section className="main">
        <div className="mainView">
          <h1>Check Availabliity</h1>
          <div className="castList">
            <p> Filter by dancer </p>
            <table>
              <tbody>
              <tr className="categories">
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
          <div className="overlapAvailability">
          </div>
        </div>
      </section>
  );
};

}
export default CheckAvailability;