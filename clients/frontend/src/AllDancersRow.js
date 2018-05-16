import React, { Component } from 'react';
import * as Util from './util.js';
import { Link } from 'react-router-dom';
import './styling/CastingFlow.css';
import './styling/General.css';
import img from './imgs/defaultProfile.jpg';
import Button from 'material-ui/RaisedButton';
import Checkbox from 'material-ui/Checkbox';


class AllDancersRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        cast:[],
        rank: "",
        checked: {
            one: false,
            two: false,
            three: false
        },
        person: this.props.person,
        photoUrl : img,
        filterChecked : true,
        toAddToCast: {
            "action": "add", 
            "rank1": [], 
            "rank2": [], 
            "rank3": []
        },
        toDropFromCast: {
            "action": "remove",
            "drops" : []
        },
        add : 0
    }
  };
  

  componentDidMount(){

    //just do this for selectCast
      if(this.props.selectCast){
        let rank = this.props.rank
        if (rank === 1) {
            this.setState({
                checked:{
                    one: true,
                    two: false,
                    three: false
                },
                add : 1
            })
        } else if (rank === 2) {
            this.setState({
                checked:{
                    one: false,
                    two: true,
                    three: false
                },
                add : 2
            })
        } else if (rank === 3) {
            this.setState({
                checked:{
                    one: false,
                    two: false,
                    three: true
                },
                add : 3
            })
        } else {
            this.setState({
                checked:{
                    one: false,
                    two: false,
                    three: false
                },
                add : 0
            })
        }
    }

    //do this for all row types
    this.getPhoto()
  }

  //only called for select cast
  //this happens when a user clicks a check box - if they are adding a user to the cast it adds them here, same for removing
  updateCheck = (event) => {
    let val = event.target.value

    //handling only allowing one to be checked at a time
    if (val === "1") {
        if(this.state.checked.one){
            this.updateCast(0)
        } else {
            this.updateCast(1)
        }
        this.setState({
            checked:{
                one: !this.state.checked.one,
                two: false,
                three: false
            }
            
        })
    } else if (val === "2") {
        if(this.state.checked.two){
            this.updateCast(0)
        } else {
            this.updateCast(2)
        }
        this.setState({
            checked:{
                one: false,
                two: !this.state.checked.two,
                three: false
            }
        })
    } else if (val === "3") {
        if(this.state.checked.three){
            this.updateCast(0)
        } else {
            this.updateCast(3)
        }
        this.setState({
            checked:{
                one: false,
                two: false,
                three: !this.state.checked.three
            }
        })
    }
  }

    //only called on Check Availability
    onCheck = () => {
        this.setState({
            filterChecked : !this.state.filterChecked
        })
        this.props.filterCast(this.state.person.id)
    }  

    updateCast = (rank) => {
        this.props.updateCast(this.state.person.id, rank)
        this.setState({
            add : rank
        })
    }

  dropFromCast = () => {
    let castBody = {
        "action": "remove",
        "drops" : [this.state.person.id]
    }

    Util.makeRequest("auditions/" + this.props.audition + "/casting", castBody, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })
  }

  addToCast = (rank) => {
    let castBody = {
        "action":"add"
    }
    if (rank === 1) {
        castBody.rank1 = [this.state.person.id]
    } else if (rank === 2) {
        castBody.rank2 = [this.state.person.id]
    } else if (rank === 3) {
        castBody.rank3 = [this.state.person.id]
    }

    Util.makeRequest("auditions/" + this.props.audition + "/casting", castBody, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })
  }

  getPhoto = () => {
    fetch(Util.API_URL_BASE + "users/" + this.state.person.id +"/photo?auth=" + localStorage.auth)
    .then((res) => {
      if (res.ok) {
        return res.blob();
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        return(URL.createObjectURL(data))
    })
    .then(url => {
        this.setState({
            photoUrl : url
        })
    }).catch((err) => {
      Util.handleError(err)
    });
  }

  render() {
    let p = this.state.person
    let hasComments = true
    if (this.props.comments === undefined) {
        hasComments = false
    } else if (this.props.comments.length === 0){
        hasComments = false
    }
    let choreographers = this.props.choreographers
    let choreos = []
    if (choreographers) {
        choreos = choreographers.map((choreo, i) => {
            return (
                <p className="choreos" key={i}>{ choreo.firstName + " " + choreo.lastName.charAt(0) + "." } 	&nbsp; </p>
            )
        })
    }

    return (
      <tr>
          {
            this.props.checkAvailability &&
                <td>
                    <Checkbox
                        onCheck = {this.onCheck}
                        checked = {this.state.filterChecked}
                    />
                </td>
            }
        {
            !this.props.checkAvailability &&
            <td className="avatarWrap">
                <img src={this.state.photoUrl} alt="profile" className="avatar"/>
            </td>
        }
        <td className="dancerAssignedNumber">
            {this.props.regNum}
        </td>
        <td>
            {/* ADD CLASSNAME HERE TO STYLE LINK NAME */}
            <Link className="personNameLink" to={{pathname: "/users/" + p.id}} target="_blank">{p.firstName + " " + p.lastName}</Link>
        </td>
        {
            this.props.selectCast &&
                <td>
                    {this.props.numPieces}
                </td>
        }
        {
            this.props.resolveConflict &&
                <td>
                    {this.props.numPieces}
                </td>
                
        }
        {
            this.props.resolveConflict &&
                <td className="dancerRank">
                    {this.props.rank}
                </td>
                
        }
        {
            this.props.resolveConflict &&
                <td>
                    {choreos}
                </td>
        }
        {
            this.props.checkAvailability &&
                <td>
                    {
                    hasComments &&
                    <div className="tooltip">
                        <i className="fas fa-comment"></i>
                        <span className="tooltiptext">{this.props.comments[0].comment}</span>
                    </div>
                    }
                </td>
        }
        <td>
            {
                this.props.selectCast && 
                    <section className="personRankBoxes">
                        <div className="check">
                            <Checkbox
                            inputStyle={{backgroundColor: 'red'}}
                            iconStyle={{fill:'black'}}
                                value="1"
                                checked={this.state.checked.one}
                                onCheck={this.updateCheck}
                            />
                        </div>
                        <div className="check">
                            <Checkbox 
                            iconStyle={{fill:'black'}}
                                value="2"
                                checked={this.state.checked.two}
                                onCheck={this.updateCheck}
                            />
                        </div>
                        <div className="check">
                            <Checkbox
                            iconStyle={{fill:'black'}}
                                value="3"
                                checked={this.state.checked.three}
                                onCheck={this.updateCheck}
                            />
                        </div>
                    </section>
            }
            {
                this.props.resolveNotYourCast &&
                    <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={() => this.addToCast(1)}> 
                    ADD </Button>
            }
            {
                this.props.resolveYourCast &&
                    <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={() => this.dropFromCast()}> 
                    DROP </Button>
            }
            {
                this.props.resolveConflict &&
                    <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={() => this.dropFromCast()}> 
                    DROP </Button>
            }
            {
                this.props.checkAvailability &&
                    <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={() => this.dropFromCast()}> 
                    DROP </Button>
            }
        </td>
      </tr>
  );
};

}
export default AllDancersRow;