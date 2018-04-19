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
import './styling/CastingFlow.css';


class Casting extends Component {
  constructor(props) {
   super(props);
   this.state ={
    finished: false, 
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
        <div className="card-casting">
          <div className="castingFlowWrap">

              {/*This is the stepper styling - you can click the steps to go between them*/}
              <div className="castingFlow" style={{ width: '100%', maxWidth: '100%', margin: 'auto'}}>
                <Stepper linear={true} activeStep={stepIndex}>
                  <Step>
                    <StepButton className="steps"  onClick={() => this.setState({ stepIndex: 0 })} >
                      Select Your Cast
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton className="steps" onClick={() => this.setState({ stepIndex: 1 }) } style={{ color: 'red' }}>
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
                    <FlatButton
                      label="Back"
                      backgroundColor="#708090"
                      style={{color: '#ffffff'}}
                      disabled={stepIndex === 0}
                      onClick={this.handlePrev}
                      className="back-button-styles-css"
                    />
                    <RaisedButton
                      label="Next"
                      backgroundColor="#708090"
                      style={{color: '#ffffff'}}
                      disabled={stepIndex === 3}
                      primary={true}
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

        {this.getStepContent(stepIndex)}

      </section>
      
    );
  };

}
export default Casting;

