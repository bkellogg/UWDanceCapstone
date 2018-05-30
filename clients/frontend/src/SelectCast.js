import React, { Component } from 'react';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';
import AllDancersRow from './AllDancersRow';

class SelectCast extends Component {
  constructor(props) {
    super(props);
    this.state = {
      toAddToCast: {
        "action": "add",
        "rank1": [],
        "rank2": [],
        "rank3": []
      },
      toDropFromCast: {
        "action": "remove",
        "drops": []
      }
    };
  };

  updateCast = (id, rank) => {
    let add = this.state.toAddToCast
    let drop = this.state.toDropFromCast

    //either way you have to remove them from the ranks (in the case of dropping a user and updating a rank)
    add.rank1 = add.rank1.filter(item => item !== id)
    add.rank2 = add.rank2.filter(item => item !== id)
    add.rank3 = add.rank3.filter(item => item !== id)

    if (rank === 0) { //if rank = 0 then we are trying to remove the user from the cast

      // add them to the drop cast
      drop.drops.push(id)

    } else { //we are trying to add a user to the cast
      //first remove them from the drop list if they're there
      drop.drops = drop.drops.filter(item => item !== id)

      //then add them to the appropriate rank in add cast
      if (rank === 1) {
        add.rank1.push(id)
      } else if (rank === 2) {
        add.rank2.push(id)
      } else if (rank === 3) {
        add.rank3.push(id)
      }
    }

    this.props.addToCast(add)
    this.props.dropFromCast(drop)

    this.setState({
      toAddToCast: add,
      toDropFromCast: drop
    })
  }

  render() {
    let castRows = []
    let uncastRows = []
    let conflictRows = []

    const cast = this.props.cast
    const uncast = this.props.uncast
    const conflict = this.props.contested
    //check - does the prop exist. if yes, proceed
    if (cast) {
      castRows = cast.map((dancer) => {
        return (
          <AllDancersRow updateCast={this.updateCast} person={dancer.dancer.user} key={dancer.dancer.user.id} regNum={dancer.dancer.regNum} numPieces={dancer.dancer.numShows} rank={dancer.rank} selectCast={true} audition={this.props.auditionID} />
        )
      })
    }
    if (uncast) {
      uncastRows = uncast.map((dancer) => {
        return (
          <AllDancersRow updateCast={this.updateCast} person={dancer.user} key={dancer.user.id} regNum={dancer.regNum} numPieces={dancer.numShows} rank={dancer.rank} selectCast={true} audition={this.props.auditionID} />
        )
      })
    }
    if (conflict) {
      conflictRows = conflict.map(conflict => {
        let dancer = conflict.rankedDancer.dancer
        return (
          <AllDancersRow updateCast={this.updateCast} person={dancer.user} key={dancer.user.id} regNum={dancer.regNum} numPieces={dancer.numShows} rank={conflict.rankedDancer.rank} selectCast={true} audition={this.props.auditionID} />
        )
      })
    }

    return (

      <section>
        <div className="mainView mainContentView">
          <div className="pageContentWrap">
            <div className="fullWidthCard scrollableCard">
              <h2 className="smallHeading">Select Cast</h2>
              <div className="xtraInfo tooltip">
                <i className="fas fa-question-circle"></i>
                <span className="tooltiptext">You can <b className="emphasis">rank</b> your top choices and <b className="emphasis">view</b> dancer profiles. Click <b className="emphasis">next</b> to submit your choices.</span>
              </div>
              <table className="table" id="selectCastTable">
                <tbody>
                  <tr className="categories">
                    <th className="avatarWrap"></th>
                    <th>#</th>
                    <th>Name</th>
                    <th>Pieces</th>
                    <th className="personRankBoxes">
                      Rank
                    <br />
                      <div className="check rank">1</div>
                      <div className="check rank"> 2</div>
                      <div className="check rank"> 3</div>
                    </th>
                  </tr>
                  {castRows.length > 0 &&
                    <tr className="variableCastHeader">
                      <td className="selectedCastDividerText">Your Cast</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  }
                  {castRows}
                  {conflictRows.length > 0 &&
                    <tr className="variableCastHeader">
                      <td className="selectedCastDividerText">Conflicts</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  }
                  {conflictRows}
                  {uncastRows.length > 0 &&
                    <tr className="variableCastHeader">
                      <td className="selectedCastDividerText">Uncast Dancers</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                  }
                  {uncastRows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    );
  };

}


export default SelectCast;