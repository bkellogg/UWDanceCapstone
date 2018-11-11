import React, { Component } from 'react';
import Button from 'material-ui/RaisedButton';
import logo from './imgs/logoex.png'
import './styling/Landing.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      signUp: false,
      authorized: false,
    };
  };

  render() {
    return (
      <section>
        <div className="landingBackground">
          <div className="landingView">
            <div className="landingBanner">
              <div className="landingLogoWrap">
                <img className="officialLogoLandingPage" alt="logo" src={logo} />
              </div>
              <div className="landingButtonsWrap">
                <div className="logInSignUpButton">
                  <Button
                    className="logInRedirectButton"
                    onClick={this.props.logIn}>
                    Sign In</Button>
                  <Button
                    className="signUpRedirectButton"
                    onClick={this.props.signUp}>
                    Sign Up</Button>
                </div>
              </div>
            </div>
            <div className="landingContent">
              <div className="capstoneInfoWrap">
              <h1>Production Management for the Department of Dance</h1>
                <div className="capstoneInfo">
                  <h2 className="capstoneInfoHeading" style={{borderBottom: "1px grey solid"}}> About </h2>
                  <p>STAGE is a resource that was developed for the University of Washington's Department of Dance. This tool is used to manage
                    three main productions each year - Faculty Dance Concert, Dance Major's Concert, and the MFA Concert. STAGE provides a central hub 
                    for artistic directors, choreographers and dancers to manage productions, pieces, and rehearsals.
                  </p>
                  <p>
                  <b>You can visit the Department of Dance's main site <a href="https://dance.washington.edu/" target="_blank" rel="noopener noreferrer"> here.</a></b>
                  </p>
                </div>
                <div className="capstoneInfo">
                  <h2 className="capstoneInfoHeading" style={{borderBottom: "1px grey solid"}}> Use </h2>
                  <p className="capstoneInfoContent"> Dancers</p>
                  <p>As a dancer, you are able to build a profile and register for auditions. By filling out your audition registration ahead of time, you can 
                    get yourself firmly into your audition headspace as you arrive at the audition. If you are cast in a piece, you will recieve an email as well as 
                    a notification here on STAGE to accept your casting, and upon accepting, will have access to your choreographers contact information and rehearsal calendar.
                  </p>
                  <p className="capstoneInfoContent"> Choreographers</p>
                  <p>As a choreographer, begin your process by signing up, and optionally filling out a profile. Contact your Artistic Director to have your permissions upgraded,
                    and once that is done, you will be able to see everyone registered for auditions and go through our casting process. Upon selecting your cast, you will be able to
                    view and manage critical aspects of your piece, including adding extra rehearsals, modifying your cast, adding production staff and filling out general piece information.
                  </p>
                  <p className="capstoneInfoContent"> Production Staff</p>
                  <p>If you are a member of the production staff, such as a costume designer or lighting designer, begin by signing up here. Contact your choreographer to have your permissions
                    appropriately elevated and get added to the piece(s) you are overseeing. Once this is done you will be able to see the cast, rehearsal schedule, and information about the piece.
                  </p>
                  <p className="capstoneInfoContent"> Artistic Director</p>
                  <p>If you are an incoming artistic director, or other admin personell, please contact the STAGE team or current artistic director to have your account created.</p>
                  <p className="capstoneInfoContent"> University of Washington Terms of Use </p>
                  <p>For more information on how the University of Washington manages your privacy and your use of their sites, please visit their <a href="http://www.washington.edu/online/privacy/"  target="_blank" rel="noopener noreferrer">Online Privacy Statement</a> and their <a href="http://www.washington.edu/online/terms/"  target="_blank" rel="noopener noreferrer">Website Terms and Conditions of Use</a></p>
                </div>
                <div className="capstoneInfo theTeamCard">
                  <h2 className="capstoneInfoHeading" style={{borderBottom: "1px grey solid"}}> Meet The Team </h2>
                  <p>This product was developed by a team of 4 Informatics students as part of their senior capstone. Passion for the arts, and technological skill, drove their choices with the application. 
                    We would like the thank the UW and the Department of Dance for their support and cooperation in making this project a success!
                  </p>
                  <div className="teamMember">
                    <p className="teamMemberName"><a href="https://www.linkedin.com/in/brendankellogg/"  target="_blank" rel="noopener noreferrer">Brendan Kellogg</a></p>

                  </div>
                  <div className="teamMember">
                    <p className="teamMemberName"> <a href="https://www.linkedin.com/in/rosemary-adams-067499104/"  target="_blank" rel="noopener noreferrer">Rosemary Adams</a></p>
                  </div>
                  <div className="teamMember">
                    <p className="teamMemberName"><a href="https://www.linkedin.com/in/mazmans"  target="_blank" rel="noopener noreferrer">Saniya Mazmanova</a></p>

                  </div>
                  <div className="teamMember">
                    <p className="teamMemberName"><a href="https://www.linkedin.com/in/nathan-swanson/"  target="_blank" rel="noopener noreferrer">Nathan Swanson</a></p>

                  </div>
                  
                </div>
              </div>
            </div>
            <p><i>Photo credit: Steve Korn </i> </p>
          </div>
        </div>
      </section>
    );
  };

}
export default App;