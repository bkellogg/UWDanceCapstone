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
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';
import './styling/CastingFlowTablet.css';

//icons
import ArrowBackIcon from 'mdi-react/ArrowBackIcon';
import ArrowForwardIcon from 'mdi-react/ArrowForwardIcon';


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
      }
    }
  };

  componentDidMount() {

    //this will take the message returned from the socket and store it in state
    this.props.websocket.addEventListener("message", (event) => {
      //TODO only do this for casting socket updates
      let update = JSON.parse(event.data)

      this.setState({
        cast: update.data.cast,
        uncast : update.data.uncasted,
        contested : update.data.contested
      })

  })

    //add user to casting session
    Util.makeRequest("auditions/" + this.props.audition + "/casting", "", "PUT", true)
      .then((res) => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .catch(err => {
        console.error(err)
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
    Util.makeRequest("auditions/" + this.props.audition + "/casting", this.state.addToCast, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })

    Util.makeRequest("auditions/" + this.props.audition + "/casting", this.state.dropFromCast, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })
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
        return <SetRehearsals cast={this.state.cast} contested={this.state.contested}/>
      default:
        return 'Someone is off the counts - stop the music, and refresh the page!';
    }
  }

  render() {
    const { stepIndex } = this.state;
    const contentStyle = { margin: '0 16px' };
    return (
      <section className="main">
        <div className="mainView">
          <h1>Casting</h1>
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
          {/*CONTENT*/}

        </div>

        {
          this.getStepContent(stepIndex)
        }

      </section>

    );
  };

}
export default Casting;

