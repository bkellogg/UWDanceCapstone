import React, { Component } from 'react';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import SelectCast from './SelectCast';
import CheckAvailability from './CheckAvailability';
import ResolveConflict from './ResolveConflict';
import SetRehearsals from './SetRehearsals';
import './styling/General.css';


class Casting extends Component {
  constructor(props) {
   super(props);
   this.state ={
     stepIndex: 0,
     user: JSON.parse(localStorage.getItem("user"))
   }
  };

  //handles a next click
  handleNext = () => {
    const { stepIndex } = this.state;
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

  //This takes the stepIndex and returns the component that should be rendered
  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return <SelectCast auditionID={this.props.audition} />
      case 1:
        return <CheckAvailability />;
      case 2:
        return <ResolveConflict />;
      case 3:
        return <SetRehearsals />
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
        <div className="card1">
          <div className="castingFlowWrap">

              {/*This is the stepper styling - you can click the steps to go between them*/}
              <div className="castingFlow" style={{ width: '100%', maxWidth: '90%', margin: 'auto' }}>
                <Stepper linear={true} activeStep={stepIndex}>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 0 })}>
                      Select Your Cast
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 1 })}>
                      Check Availability
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 2 })}>
                      Resolve Conflicts
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton onClick={() => this.setState({ stepIndex: 3 })}>
                      Post Casting
                    </StepButton>
                  </Step>
                </Stepper>

                {/*BUTTONS*/}
                <div style={contentStyle}>
                  <div style={{ marginTop: 12 }}>
                    <FlatButton
                      label="Back"
                      disabled={stepIndex === 0}
                      onClick={this.handlePrev}
                      style={{ marginRight: 12 }}
                    />
                    <RaisedButton
                      label="Next"
                      disabled={stepIndex === 3}
                      primary={true}
                      onClick={this.handleNext}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/*CONTENT*/}
          {this.getStepContent(stepIndex)}
        </div>
      </section>
    );
  };

}
export default Casting;

