import React, { Component } from 'react';
import * as Util from './util';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import SelectCast from './SelectCast';
import CheckAvailability from './CheckAvailability';
import ResolveConflict from './ResolveConflict';
import SetRehearsals from './SetRehearsals';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';
import './styling/CastingFlowTablet.css';

//icons
import ArrowBackIcon from 'mdi-react/ArrowBackIcon';
import ArrowForwardIcon from 'mdi-react/ArrowForwardIcon';

const WEBSOCKET = new WebSocket("wss://" + Util.HOST + "/api/v1/updates?auth=" + localStorage.getItem("auth"));

class Casting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      finished: false,
      stepIndex: 0,
      user: JSON.parse(localStorage.getItem("user")),
      cast: [],
      uncast: [],
      contested: [],
      addToCast: {
        "action":"add"
      },
      dropFromCast: {
        "action":"remove"
      },
      open: true,
      error: false
    }
  };

  componentDidMount() {
    //this will take the message returned from the socket and store it in state
    WEBSOCKET.addEventListener("message", (event) => {
      //TODO only do this for casting socket updates
      let update = JSON.parse(event.data)

      this.setState({
        cast: update.data.cast,
        uncast : update.data.uncasted,
        contested : update.data.contested
      })

    })
  }

  //handles a next click
  handleNext = () => {
    const stepIndex = this.state.stepIndex;

    if (stepIndex === 0){
      this.updateCast()
    }

    if (stepIndex < 3) {
      this.setState({ stepIndex: stepIndex + 1 });
    }
  };


  //handles a prev click
  handlePrev = () => {
    const { stepIndex } = this.state;
    if (stepIndex > 0) {
      this.setState({ stepIndex: stepIndex - 1 });
    }
  };

  updateCast = () => {
    if (this.state.addToCast.rank1 || this.state.addToCast.rank2 || this.state.addToCast.rank3) {
      Util.makeRequest("auditions/" + this.props.audition + "/casting", this.state.addToCast, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        if (res.status === 401) {
          Util.signOut()
        }
        return res.text().then((t) => Promise.reject(t));
      })
    }
    
    if (this.state.dropFromCast.drops) {
      Util.makeRequest("auditions/" + this.props.audition + "/casting", this.state.dropFromCast, "PATCH", true)
        .then(res => {
          if (res.ok) {
            return res.text()
          }
          if (res.status === 401) {
            Util.signOut()
          }
          return res.text().then((t) => Promise.reject(t));
        })
      }
  }

  //This takes the stepIndex and returns the component that should be rendered
  getStepContent(stepIndex) {
    
    switch (stepIndex) {
      case 0:
        return <SelectCast auditionID={this.props.audition} cast={this.state.cast} uncast={this.state.uncast} contested={this.state.contested} 
                           addToCast={add => {this.setState({addToCast:add})}} dropFromCast={drop => {this.setState({dropFromCast:drop})}}/>
      case 1:
        return <CheckAvailability cast={this.state.cast} contested={this.state.contested}/>;
      case 2:
        return <ResolveConflict audition={this.props.audition} cast={this.state.cast} uncast={this.state.uncast} contested={this.state.contested}/>;
      case 3:
        return <SetRehearsals audition={this.props.audition} cast={this.state.cast} contested={this.state.contested}/>
      default:
        return 'Someone is off the counts - stop the music, and refresh the page!';
    }
  }

  enterCasting = () => {
    Util.makeRequest("auditions/" + this.props.audition + "/casting", "", "PUT", true)
    .then((res) => {
      if (res.ok) {
        return res.text()
      }
      if (res.status === 401) {
        Util.signOut()
      }
      if (res.status === 400) {
        this.setState({
          error: "This show is not currently casting. Contact your administrator if you believe this is inaccurate."
        })
      }
      return res.text().then((t) => Promise.reject(t));
    })
    .then(
      this.setState({
        open: false,
      })
    )
    .catch(err => {
      console.error(err)
    })
  }

  cancelCast = () => {
    //sends the user  to the dashboard
    window.location = "/"
  }
  

  render() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 16px' };
    return (
      <section className="main">
        <div className="mainView">
          <h1>Casting {this.props.name}</h1>
          
          {this.state.error &&
            <div>
              {this.state.error}
            </div>
          }

          {!this.state.error && this.state.open === false &&
            <div className="card-casting">
              <div className="castingFlowWrap">

                {/*This is the stepper styling - you can click the steps to go between them*/}
                <div className="castingFlow" style={{ width: '100%', maxWidth: '100%', margin: 'auto', color: "red" }}>
                  <Stepper linear={true} activeStep={stepIndex}>
                    <Step>
                      <StepButton className="steps" onClick={() => this.setState({ stepIndex: 0 })} >
                        Select Your Cast
                      </StepButton>
                    </Step>
                    <Step>
                      <StepButton className="steps" onClick={() => this.setState({ stepIndex: 1 })}>
                        Check Availability
                      </StepButton>
                    </Step>
                    <Step>
                      <StepButton className="steps" onClick={() => this.setState({ stepIndex: 2 })}>
                        Resolve Conflicts
                      </StepButton>
                    </Step>
                    <Step>
                      <StepButton className="steps" onClick={() => this.setState({ stepIndex: 3 })}>
                        Post Casting
                      </StepButton>
                    </Step>
                  </Stepper>

                  {/*BUTTONS*/}
                  <div style={contentStyle}>
                    <div style={{ marginTop: 12 }}>
                      <ArrowBackIcon 
                        size={26} 
                        disabled={stepIndex === 0}
                        onClick={this.handlePrev}
                        className="back-button-styles-css"
                      />
                      <ArrowForwardIcon 
                        size={26} 
                        disabled={stepIndex === 3}
                        onClick={this.handleNext}
                        className="next-button-styles-css"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>

        { 
          !this.state.error &&
          this.state.open === false &&
          this.getStepContent(stepIndex)
        }

        <Dialog
          title="Enter Casting"
          actions={[
            <FlatButton
              label="Cancel"
              style={{ backgroundColor: 'transparent', color: 'hsl(0, 0%, 29%)', marginRight: '20px' }}
              primary={false}
              onClick={this.cancelCast}
            />,
            <FlatButton
              label="Enter Casting"
              style={{ backgroundColor: '#22A7E0', color: '#ffffff' }}
              primary={false}
              keyboardFocused={true}
              onClick={this.enterCasting}
            />,
          ]}
          modal={false}
          open={this.state.open}
        >
          <div className="warningText"> By clicking Enter Casting you confirm that you are a choreograper for 
          <strong className="importantText warningText">{" " + this.props.name + " "}</strong> 
          and that you are currently casting for the show.</div>
        </Dialog>

      </section>

    );
  };

}
export default Casting;

