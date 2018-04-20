import React, { Component } from 'react';
import CastDancersRow from './CastDancersRow'
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class CheckAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cast: JSON.parse(localStorage.getItem("socketCast"))
    }
  };

  render() {
   const cast = JSON.parse(localStorage.getItem("socketCast"))
    let rows = cast.map(dancer => {
      return (
        <CastDancersRow key={dancer.dancer.user.id} person={dancer.dancer.user} regNum={dancer.dancer.regNum} comments ={dancer.dancer.comments} filter={true} />
      )
    })

    return (
      <section>
        <div className="mainView">
          <div className="transparentCard">
            <div className="wrap">
              <div className="castList">

                <div className="dancersList-filter">
                  <h2 className="smallHeading"> Filter by dancer </h2>
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
                <div className="overlapAvailability">Cast availability goes here </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  };

}
export default CheckAvailability;