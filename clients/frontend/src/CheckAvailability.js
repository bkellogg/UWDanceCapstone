import React, { Component } from 'react';
import AllDancersRow from './AllDancersRow'
import AvailabilityOverlap from './AvailabilityOverlap';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';


class CheckAvailability extends Component {
  constructor(props) {
    super(props);
    this.state = {
        filteredCast: []
    }
  };

  componentDidMount(){
    //setTimeout(() => {this.orderTable("checkAvailabilityTable")}, 200)
    let filteredCast = this.state.filteredCast
    this.props.cast.map((dancer, i) => {
      filteredCast.push(dancer.dancer.user.id)
    })
    this.setState({
      filteredCast : filteredCast
    })
    console.log(filteredCast)
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

  filterCast = (id) => {

    let filteredCast = this.state.filteredCast //this will initially have all the ids of all the cast members, because they are all selected
    //we are going to take the id from a check, and if the id is in the list already, we'll remove it, and if it isn't then we'll add it
    let index = filteredCast.indexOf(id)
    if (index !== -1) { //if the id is already in the cast
      filteredCast = filteredCast.filter(i => i !== id) //remove them
    } else { //the id is not in the cast
      filteredCast.push(id)
    } 
    this.setState({
      filteredCast : filteredCast
    })
  }

  render() {
    let rows = []
    let conflictRows = []
    if (this.props.cast) {
      rows = this.props.cast.map(dancer => {
        return (
          <AllDancersRow key={dancer.dancer.user.id} person={dancer.dancer.user} comments={dancer.dancer.comments} regNum={dancer.dancer.regNum} checkAvailability={true} filterCast={(id) => this.filterCast(id)}/>
        )
      })
    }
    if(this.props.contested) {
      conflictRows = this.props.contested.map(conflict => {
        let dancer = conflict.rankedDancer.dancer
        return(
          <AllDancersRow key={dancer.user.id} person={dancer.user} comments={dancer.comments} regNum={dancer.regNum} checkAvailability={true} filterCast={(id) => this.filterCast(id)} />
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
                      {conflictRows}
                    </tbody>
                  </table>
                </div>
                <div className="overlapAvailability">
                  <AvailabilityOverlap cast={this.props.cast} filteredCast={this.state.filteredCast}/>
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