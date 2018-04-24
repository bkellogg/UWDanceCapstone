import React, { Component } from 'react';
import * as Util from './util';
import {
  Step,
  Stepper,
  StepButton,
} from 'material-ui/Stepper';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import SelectCast from './SelectCast';
import CheckAvailability from './CheckAvailability';
import ResolveConflict from './ResolveConflict';
import SetRehearsals from './SetRehearsals';
import './styling/General.css';
import './styling/CastingFlow.css';
import './styling/CastingFlowMobile.css';

//icons
import ArrowBackIcon from 'mdi-react/ArrowBackIcon';
import ArrowForwardIcon from 'mdi-react/ArrowForwardIcon';


class Casting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      finished: false,
      stepIndex: 0,
      user: JSON.parse(localStorage.getItem("user"))
    }
  };

  componentDidMount() {
    localStorage.setItem("socketCast", JSON.stringify([]))
    localStorage.setItem("contested", JSON.stringify([]))
    localStorage.setItem("uncasted", JSON.stringify([]))
    //this will take the message returned from the socket and do something with it
    this.props.websocket.addEventListener("message", function (event) {

      //if(event.data.eventType === "casting"){
      let update = JSON.parse(event.data)

      let cast = JSON.stringify(update.data.cast)
      let uncast = JSON.stringify(update.data.uncasted)
      let contested = JSON.stringify(update.data.contested)

      localStorage.socketCast = cast
      localStorage.contested = contested
      localStorage.uncasted = uncast
      //}
    })

    console.log(this.props.audition)
    //add user to casting session
    Util.makeRequest("auditions/" + this.props.audition + "/casting", "", "POST", true)
      .then((res) => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })
      .catch(err => {
        //console.error(err)
      })
  }

  //handles a next click
  handleNext = () => {
    const stepIndex = this.state.stepIndex;

    //direct traffic
    if (stepIndex === 0) {
      this.setCast()
    } else if (stepIndex === 2) {
      console.log('sending cast updates')
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

  setCast = () => {
    //format casting into the proper body
    let castBody = {
      "action": "add",
      "rank1": [],
      "rank2": [],
      "rank3": []
    }

    let rank1 = castBody.rank1
    let rank2 = castBody.rank2
    let rank3 = castBody.rank3

    let cast = JSON.parse(localStorage.getItem("cast"))
    cast.forEach(dancer => {
      let id = dancer.id
      let rank = dancer.rank
      if (rank === "1") {
        rank1.push(id)
        return rank1
      } else if (rank === "2") {
        rank2.push(id)
        return rank2
      } else if (rank === "3") {
        rank3.push(id)
        return rank3
      }
      return
    })

    castBody.rank1 = rank1
    castBody.rank2 = rank2
    castBody.rank3 = rank3


    Util.makeRequest("auditions/" + this.props.audition + "/casting", castBody, "PATCH", true)
      .then(res => {
        if (res.ok) {
          return res.text()
        }
        return res.text().then((t) => Promise.reject(t));
      })


    this.setState({ stepIndex: 0 })
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
              <div className="castingFlow" style={{ width: '100%', maxWidth: '100%', margin: 'auto' }}>
                <Stepper linear={true} activeStep={stepIndex}>
                  <Step>
                    <StepButton className="steps" onClick={() => this.setState({ stepIndex: 0 })} >
                      Select Your Cast
                    </StepButton>
                  </Step>
                  <Step>
                    <StepButton className="steps" onClick={() => this.setState({ stepIndex: 1 })} style={{ color: 'red' }}>
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
                      primary={true}
                      onClick={this.handleNext}
                      className="next-button-styles-css"
                    />
                    {/* <FlatButton
                      label="Back"
                      // backgroundColor="transparent"
                      // style={{ color: '#333333' }}
                      disabled={stepIndex === 0}
                      onClick={this.handlePrev}
                      className="back-button-styles-css"
                    /> */}
                    {/* <FlatButton
                      label="Next"
                      // backgroundColor="transparent"
                      // style={{ color: '#333333' }}
                      disabled={stepIndex === 3}
                      // primary={true}
                      onClick={this.handleNext}
                      className="next-button-styles-css"
                    /> */}
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

