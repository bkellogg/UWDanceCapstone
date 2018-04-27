import React, { Component } from 'react';
import AllDancersRow from './AllDancersRow'
import AvailabilityOverlap from './AvailabilityOverlap';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class CheckAvailability extends Component {

  componentDidMount(){
    setTimeout(() => {this.orderTable("checkAvailabilityTable")}, 200)
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
        x = rows[i].getElementsByTagName("td")[2];
        y = rows[i + 1].getElementsByTagName("td")[2];
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
                  <table id="checkAvailabilityTable">
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
                  <AvailabilityOverlap cast={this.props.cast}/>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    );
  };

}
export default CheckAvailability;