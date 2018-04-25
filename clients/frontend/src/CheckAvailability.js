import React, { Component } from 'react';
import AllDancersRow from './AllDancersRow'
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class CheckAvailability extends Component {

  render() {
    let rows = []

    if (this.props.cast) {
      rows = this.props.cast.map(dancer => {
        return (
          <AllDancersRow key={dancer.dancer.user.id} person={dancer.dancer.user} comments={dancer.dancer.comments} regNum={dancer.dancer.regNum} checkAvailability={true}/>
        )
      })
    }
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