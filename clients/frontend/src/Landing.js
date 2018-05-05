import React, { Component } from 'react';
import Button from 'material-ui/RaisedButton';
import logo from './imgs/logoex.png'
import brendanKellog from './imgs/brendan.jpeg'
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
              <div className="logInSignUpButtonWrap">
                <div className="logInSignUpButton">
                  <Button
                    className="logInRedirectButton"
                    onClick={this.props.logIn}
                    buttonStyle={{ borderRadius: '5' }}>
                    Sign In</Button>
                  <Button
                    className="signUpRedirectButton"
                    onClick={this.props.signUp}>
                    Sign Up</Button>
                </div>
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
                    <table id="dancers">
                      <tbody>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; Create a consistent online profile:</th>
                        </tr>
                        <tr>
                          <td className="capstoneInfoContent indentContentDouble">&#183; Headshots</td>
                        </tr>
                        <tr>
                          <td className="capstoneInfoContent indentContentDouble">&#183; Bios</td>
                        </tr>
                        <tr>
                          <td className="capstoneInfoContent indentContentDouble">&#183; Resumes</td>
                        </tr>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; Easily register for auditions</th>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* CHOREOGRAPHERS */}
                  <div className="userSectionsBrokenDown">
                    <p className="capstoneInfoContent"><b><u>Choreographers</u></b></p>
                    <table id="choreographers">
                      <tbody>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; View dancer information </th>
                        </tr>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; Resolve casting conflicts</th>
                        </tr>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; Set rehearsal schedules</th>
                        </tr>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; Send casting immediately</th>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* DIRECTORS */}
                  <div className="userSectionsBrokenDown">
                    <p className="capstoneInfoContent" ><b><u>Directors</u></b></p>
                    <table id="directors">
                      <tbody>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; View all casts</th>
                        </tr>
                        <tr>
                          <th className="capstoneInfoContent userRoleHeader">&#10003; Manage auditions and choreographers</th>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="capstoneInfoContent"> The Artistic Director will be able to manage auditions and choreographers, view everyone involved in the show,
                  and gather contact information for various production staff.</p>
                  <p className="capstoneInfoContent" ><b><u>Admin</u></b></p>
                  <p className="capstoneInfoContent"> The department administrator will be able to create shows and auditions, elevate users in to choreographer
                  or director roles, see all contact information for everyone on the application.</p>
                </div>
                <div className="capstoneInfoSection theTeamCard">
                  <h2 className="capstoneInfoHeading"> Meet The Team </h2>
                  <div className="teamMember">
                    <img className="teamMemberImage" alt="Brendan Kellog - Backend Developer" src={brendanKellog} />
                    <p className="teamMemberName"> Brendan Kellog</p>
                    <p className="capstoneInfoContent"> Backend Developer</p>

                  </div>
                  <div className="teamMember">
                    <img className="teamMemberImage" alt="Rosemary Adams - Frontend Developer" src={rosemaryAdams} />
                    <p className="teamMemberName"> Rosemary Adams</p>
                    <p className="capstoneInfoContent"> Frontend Developer</p>

                  </div>
                  <div className="teamMember">
                    <img className="teamMemberImage" alt="Saniya Mazmanova - UX/UI Designer" src={saniyaMazmanova} />
                    <p className="teamMemberName"> Saniya Mazmanova</p>
                    <p className="capstoneInfoContent"> UX/UI Designer</p>

                  </div>
                  <div className="teamMember">
                    <img className="teamMemberImage" alt="Nathan Swanson - Project Manager" src={nathanSwanson} />
                    <p className="teamMemberName"> Nathan Swanson</p>
                    <p className="capstoneInfoContent"> Project Manager</p>

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