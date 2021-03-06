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
      cast: [],
      contested: [],
      totalCast: [],
    }
  };

  componentWillMount() {
    let filteredCast = []
    this.props.cast.map((dancer, i) => {
      filteredCast.push(dancer.dancer.user.id)
      return filteredCast
    })
    this.props.contested.map(dancer => {
      filteredCast.push(dancer.rankedDancer.dancer.user.id)
      return filteredCast
    })
    console.log(filteredCast)
    this.setState({
      //total cast will track the IDs of everyone, no matter if they are conflicted or cast so that we only 
      //update when our user makes a change, not when we get websocket updates
      totalCast: filteredCast,
      filteredCast: filteredCast,
      cast: this.props.cast,
      contested: this.props.contested
    })
  }

  //props are recieved when a user goes back and forth between casting and availability checker 
  //AND when another user updates their cast list bc cast is updated when a websocket update is recieved 
  //we only want to update our filter when the total cast for our user is affected, aka when a totalCast != the current totalCast
  componentWillReceiveProps(props) {
    let incomingTotalCast = this.setFilteredCast(props.cast, props.contested);
    let incomingCastIsDifferentThanCurrentCast = this.checkIncoming(this.state.totalCast, incomingTotalCast);
    if (!incomingCastIsDifferentThanCurrentCast) {
      this.setState({
        totalCast: this.setFilteredCast(props.cast, props.contested),
        cast: props.cast,
        contested: props.contested,
        filteredCast: this.setFilteredCast(props.cast, props.contested)
      })
    }
  }

  checkIncoming = (a, b) => {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;
    a = a.sort();
    b = b.sort();
    for (var i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
  } 

  setFilteredCast = (cast, contested) => {
    let filteredCast = []
    cast.map((dancer, i) => {
      filteredCast.push(dancer.dancer.user.id)
      return filteredCast
    })
    contested.map(dancer => {
      filteredCast.push(dancer.rankedDancer.dancer.user.id)
      return filteredCast
    })
    return filteredCast
  }

  filterCast = (id) => {

    let filteredCast = this.state.filteredCast //this will initially have all the ids of all the cast members, because they are all selected
    console.log(filteredCast)
    //we are going to take the id from a check, and if the id is in the list already, we'll remove it, and if it isn't then we'll add it
    let index = filteredCast.indexOf(id)
    if (index !== -1) { //if the id is already in the cast
      filteredCast = filteredCast.filter(i => i !== id) //remove them
    } else { //the id is not in the cast
      filteredCast.push(id)
    }
    this.setState({
      filteredCast: filteredCast
    })
  }

  render() {
    let rows = []
    let conflictRows = []

    if (this.state.cast) {
      rows = this.state.cast.map(dancer => {
        return (
          <AllDancersRow key={dancer.dancer.user.id} person={dancer.dancer.user} comments={dancer.dancer.comments} regNum={dancer.dancer.regNum} checkAvailability={true} filterCast={(id) => this.filterCast(id)} audition={this.props.auditionID}/>
        )
      })
    }
    if (this.state.contested) {
      conflictRows = this.state.contested.map(conflict => {
        let dancer = conflict.rankedDancer.dancer
        return (
          <AllDancersRow key={dancer.user.id} person={dancer.user} comments={dancer.comments} regNum={dancer.regNum} checkAvailability={true} filterCast={(id) => this.filterCast(id)} audition={this.props.auditionID}/>
        )
      })
    }
    return (
      <section>
        <div className="mainView mainContentView">
          <div className="pageContentWrap">
            <div className="castList">
              <div className="dancersList-filter">
                <h2 className="smallHeading"> Filter by dancer </h2>
                <div className="xtraInfo tooltip">
                  <i className="fas fa-question-circle"></i>
                  <span className="tooltiptext">You can <b className="emphasis">select</b> whose availability is being shown, <b className="emphasis">view</b> dancer availability comments, and <b className="emphasis">drop</b> them from your cast.</span>
                </div>
                <table id="checkAvailabilityTable">
                  <tbody>
                    <tr className="categories">
                      <th className="avatarWrap"></th>
                      <th>#</th>
                      <th>Dancer</th>
                      <th>Comment</th>
                      <th></th>
                    </tr>
                    {rows}
                    {conflictRows}
                  </tbody>
                </table>
              </div>
              <div className="overlapAvailabilityWrap">
                <AvailabilityOverlap cast={this.state.cast} contested={this.state.contested} filteredCast={this.state.filteredCast} />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

}
export default CheckAvailability;