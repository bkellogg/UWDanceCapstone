import React, { Component } from 'react';
import * as Util from './util';
import Button from 'material-ui/RaisedButton';
import img from './imgs/defaultProfile.jpg';

class ConflictRow extends Component {
  constructor(props) {
    super(props);
    this.state = {
        photoUrl: img
    }
  };

  componentDidMount(){
      this.getPhoto()
  }

  getPhoto = () => {
    fetch(Util.API_URL_BASE + "users/" + this.props.dancer.id +"/photo?auth=" + localStorage.auth)
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

  dropFromCast = () => {
    let removeBody = {
        "action":"remove",
        "drops":[
            this.props.dancer.user.id
        ]
    }
    let audition = "1"
    Util.makeRequest("auditions/" + audition + "/casting", removeBody, "PATCH", true)
    .then( res => {
      if(res.ok){
        return res.text()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(
        this.props.updateCast
    )
  }

  render() {
    let choreographers = this.props.choreographers
    console.log(choreographers)
    let dancer = this.props.dancer
    console.log(dancer)
    let choreos = choreographers.map(choreo => {
        return (
            <p className="choreos">{ choreo.firstName + " " + choreo.lastName} &nbsp; </p>
        )
    })
    return (
        <tr>
            <td>
                <img src={this.state.photoUrl} alt="profile" className="avatar"/>
            </td>
            <td className="dancerAssignedNumber">
                {dancer.regNum}
            </td>
            <td>
                {dancer.user.firstName + " " + dancer.user.lastName}
            </td>
            <td>
                {dancer.numShows}
            </td>
            <td className="dancerRank">
                {this.props.rank}
            </td>
            <td>
                {choreos}
            </td>
            <td>
            <Button 
                    backgroundColor="#708090"
                    style={{color: '#ffffff', float: 'right'}}
                    onClick={this.dropFromCast}> 
                    DROP </Button>
            </td>
        </tr>
  );
};

}
export default ConflictRow;

