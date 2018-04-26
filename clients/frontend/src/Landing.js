import React, { Component } from 'react';
import Button from 'material-ui/RaisedButton';
import logo from './imgs/logoex.png'
import brendanKellog from './imgs/brendan.jpg'
import rosemaryAdams from './imgs/rosemary.png'
import saniyaMazmanova from './imgs/saniya.jpg'
import nathanSwanson from './imgs/nathan.png'
import './styling/Landing.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      signUp: false,
      authorized: false
    };
  };

  render() {
    return (
      <section>
        <div className="landingBackground">
          <div className="landingView">
            <div className="landingHeading">
              <div className="landingLogoWrap">
                <img className="officialLogoLandingPage" alt="logo" src={logo} />
              </div>
              {/* <h1>you've landed on an alien planet</h1> */}
              <div className="logInSignUpButtonWrap">
                <Button className="logInRedirectButton" onClick={this.props.logIn}>Log In</Button>
                <Button className="signUpRedirectButton" onClick={this.props.signUp}>Sign Up</Button>
              </div>
            </div>
            <div className="landingContent">
              <div className="capstoneInfo">
                <div className="capstoneInfoSection">
                  <h2 className="capstoneInfoHeading"> About </h2>
                  <p className="capstoneInfoContent"> STAGE is the modern solution to an age old practice in the arts - producing a show.  </p>
                  <p>Our platform allows you to easily manage critical aspects of a production, by allowing every dancer to create a profile, every choreographer
                    to easily select their star cast, and giving the director a comprehensive look at every piece.
                    Our goal is to reduce the stress of scheduling and communication, and let you focus your
                energy on what really matters - getting your work on <b> STAGE.</b></p>
                </div>
                <div className="capstoneInfoSection">
                  <h2 className="capstoneInfoHeading"> Problem Space </h2>
                  <p className="capstoneInfoContent"> The inspiration for STAGE comes from the Department of Dance at the University of Washington.
                    Dancers repeatedly fill out availability forms during the audition
                    process, choreographers must rely on the legibility of the forms
                    during the casting process, and directors must painstakingly gather contact
                    information from each choreographer. Auditions can have up to 100 people in them, and one piece
                of paper per dancer leads to hours of headache inducing casting.  </p>
                </div>
                <div className="capstoneInfoSection">
                  <h2 className="capstoneInfoHeading"> Features </h2>
                  <div className="userSectionsBrokenDown">
                    <p className="capstoneInfoContent"><b><u>Dancers</u></b></p>
                    {/* DANCERS */}
                    <div id="dancers">
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; Create a consistent online profile:</p>
                   
                      
                        <p className="capstoneInfoContent indentContentDouble">&#183; Headshots</p>
                      
                      
                        <p className="capstoneInfoContent indentContentDouble">&#183; Bios</p>
                      
                      
                        <p className="capstoneInfoContent indentContentDouble">&#183; Resumes</p>
                      
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; Easily register for auditions</p>
                      
                    </div>
                  </div>

                  {/* CHOREOGRAPHERS */}
                  <div className="userSectionsBrokenDown">
                    <p className="capstoneInfoContent"><b><u>Choreographers</u></b></p>
                    <div id="choreographers">
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; View dancer information </p>
                      
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; Resolve casting conflicts</p>
                      
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; Set rehearsal schedules</p>
                      
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; Send casting immediately</p>
                      
                    </div>
                  </div>

                  {/* DIRECTORS */}
                  <div className="userSectionsBrokenDown">
                    <p className="capstoneInfoContent" ><b><u>Directors</u></b></p>
                    <div id="directors">
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; View all casts</p>
                      
                      
                        <p className="capstoneInfoContent userRoleHeader">&#10003; Manage auditions and choreographers</p>
                      
                    </div>
                  </div>
                  <p className="capstoneInfoContent"> The Artistic Director will be able to manage auditions and choreographers, view everyone involved in the show,
                  and gather contact information for various production staff.</p>
                  <p className="capstoneInfoContent" ><b><u>Admin</u></b></p>
                  <p className="capstoneInfoContent"> The department administrator will be able to create shows and auditions, elevate users in to choreographer
                  or director roles, see all contact information for everyone on the application.</p>
                </div>
                <div className="capstoneInfoSection theTeamCard">
                  <h2 className="capstoneInfoHeading"> Meet The Team </h2>
                  <div class="teamMember">
                    <img className="teamMemberImage" alt="teamMemberImage" src={brendanKellog} />
                    <p className="teamMemberName"> Brendan Kellog</p>
                    <p className="capstoneInfoContent"> Backend Developer</p>
                    <p className="capstoneInfoContent"> email@goeshere.com</p>
                  </div>
                  <div class="teamMember">
                    <img className="teamMemberImage" alt="teamMemberImage" src={rosemaryAdams} />
                    <p className="teamMemberName"> Rosemary Adams</p>
                    <p className="capstoneInfoContent"> Frontend Developer</p>
                    <p className="capstoneInfoContent"> email@goeshere.com</p>
                  </div>
                  <div class="teamMember">
                    <img className="teamMemberImage" alt="teamMemberImage" src={saniyaMazmanova} />
                    <p className="teamMemberName"> Saniya Mazmanova</p>
                    <p className="capstoneInfoContent"> UX/UI Designer</p>
                    <p className="capstoneInfoContent"> email@goeshere.com</p>
                  </div>
                  <div class="teamMember">
                    <img className="teamMemberImage" alt="teamMemberImage" src={nathanSwanson} />
                    <p className="teamMemberName"> Nathan Swanson</p>
                    <p className="capstoneInfoContent"> Project Manager</p>
                    <p className="capstoneInfoContent"> email@goeshere.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

}
export default App;