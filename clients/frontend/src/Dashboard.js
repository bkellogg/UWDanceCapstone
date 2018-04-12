import React, { Component } from 'react';
import * as Util from './util';

//styling
import { Card, CardText, CardTitle} from 'material-ui/Card';
import { Link } from 'react-router-dom';
import './styling/Dashboard.css';

class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: JSON.parse(localStorage.user),
      auth: localStorage.auth,
      announcements: []
    }
  };

  componentDidMount(){
    this.getAnnouncements()
  }

  getAnnouncements = () => {
    fetch(Util.API_URL_BASE + "/announcements?auth=" + this.state.auth)
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
          this.setState({
            announcements: data.announcements
          })
          this.getMockAnnouncements()
        })
        .catch((err) => {});
  }

  getMockAnnouncements = () => {
    let announcement = [{
      type: "Announcement",
      message: "Dance Major's Concert Opening Night TONIGHT!"
    },{
      type: "Audition",
      show: "Faculty Dance Concert",
      time: "6:00 PM",
      location: "Studio 265",
      address: "/FacultyDanceConcert"
    }]
    //let address = "/" + this.props.showTitle.split(' ').join('');
    this.setState({
      announcements: announcement
    })
  }

  render() {
      return(
        <section className='main'>
          <div className='dashboard'>
            <div id='welcome'> Welcome {this.state.user.firstName}</div>
            <div id='announcements'>
              {this.state.user.bio === "" &&
               /*this.state.user.resume &&
                  this.state.user.photo DON'T exist
                  idea: have a boolean indicating if they've uploaded one that get's set
                  during the upload process in SignUpExtra*/
                    <Card>
                    <div className="warning">
                      <CardText> 
                        Please complete your profile.
                      </CardText>
                      </div>
                    </Card>
              }
              {this.state.announcements.map((v, i) =>{
               return( 
               <div key={i} className="announcement">
                  { 
                    v.type === 'Audition' &&
                    <Card>
                      <div className="title">
                        <CardTitle title={v.type}/> 
                      </div>
                      <CardText>
                        <p> {v.show} </p>
                        <p> {v.time} </p>
                        <p> {v.location} </p>
                      <Link to={{pathname: v.address + "/audition"}}>Sign up here!</Link>
                      </CardText>
                    </Card>
                  }
                  {
                    v.type === 'Announcement' &&
                    <Card>
                      <div className="cardBody">
                        <CardText>
                        <p> {v.message} </p>
                        </CardText>
                      </div>
                    </Card>
                  }
                </div>
               )
              })}
            </div>
          </div>
        </section>
      )
  }

}


export default Dashboard;