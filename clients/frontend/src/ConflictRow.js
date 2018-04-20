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
      this.getPhoto
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
    console.log("drop")
  }

  render() {
    let choreographers = this.props.choreographers
    console.log(choreographers)
    let dancer = this.props.dancer
    console.log(dancer)
    let choreos = choreographers.map(choreo => {
        console.log(choreo)
        return (
            <p> {choreo.firstName + " " + choreo.lastName} </p>
        )
    })
    return (
        <tr>
            <td>
                <img src={this.state.photoUrl} className="avatar"/>
            </td>
            <td>
                {dancer.regNum}
            </td>
            <td>
                {dancer.user.firstName + " " + dancer.user.lastName}
            </td>
            <td>
                {dancer.numShows}
            </td>
            <td>
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

