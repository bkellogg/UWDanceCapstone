import React, { Component } from 'react';
import * as Util from './util.js';

//components
import Registration from './Registration';
import RegistrationConf from './RegistrationConf';

//styling
import './styling/Audition.css';
import './styling/General.css';

class Audition extends Component {
  constructor(props) {
    super(props);
    this.state ={
      registered: false,
      audition: null
    }
  };

  componentWillMount(){
    this.checkRegistration()
  }

  checkRegistration = () => {
    Util.makeRequest("users/me/auditions/" + this.props.audition, "", "GET", true)
    .then(res => {
      if(res.ok) {
        return res.json()
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(audition => {
      this.setState({
        registered: true,
        audition: audition.audition
      })
    })
    .catch(err => {console.log(err)})
  }

  registerUser = () => {
    this.checkRegistration()
  }

  render() {
      return(
        <section className="main">
        <div className="mainView">
          <div className="audition">
            <h1 id="auditionTitle">{this.props.name} Audition Form</h1>
            {
              this.state.registered === false &&
<<<<<<< HEAD

                // audition form
                <div className="auditionForm">
                  {/* question 1 */}
                  <div className="row">
                    <div className="question">
                      <p>1. Number of pieces I am available for: </p>
                    
                    <SelectField
                      value={this.state.value}
                      onChange={this.handleChange}
                      style={styles.customWidth}
                    >
                      <MenuItem value={1} primaryText="1" />
                      <MenuItem value={2} primaryText="2" />
                    </SelectField>
                    </div>
                  </div>


                  <br />

                  {/* question 2 */}
                  <div className="row">
                    <div className="question">
                      <p>2. You must be enrolled in a class during the quarter the production is occurring.</p> <br/>
                   
                   <br />
                    <Checkbox
                      label="I confirm I am enrolled in a class for the quarter during which the show is occuring."
                      
                    />
                    </div>
                  </div>
                  <br/>

                  {/* question 3 */}
                  <div className="row">
                    <div className="question">
                      <p>3. Availability [click & drag to indicate when you are <b>available</b> to rehearse]</p>
                    <Availability availability = {this.setAvailability}/>
                  </div>
                  </div>
                  <br/>


                  {/* question 4 */}
                  <div className="row">
                    <div className="question">
                      <p>4. Please indicate any additional notes below</p>
                    <TextField
                      name="comments"
                      onChange = {this.addComment}
                      multiLine={true}
                      rows={2}
                    />
                  </div>
                  <RaisedButton className='register' onClick={this.handleRegister} style={{backgroundColor: "#BFB2E5"}}> Register </RaisedButton>
                  </div>
                </div>

                // end audition form
=======
                <Registration audition={this.props.audition} registered={() => this.checkRegistration()} />
>>>>>>> d1434f83689d6a09c871ad1c43e019e2f60ea3d7
            }
            {
              this.state.registered === true &&
              <RegistrationConf audition={this.state.audition}/>
            }
          </div>
          </div>
        </section>
      )
  }

}


export default Audition;