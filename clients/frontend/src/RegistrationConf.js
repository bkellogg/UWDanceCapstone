import React, { Component } from 'react';

//styling
import { Card, CardText, CardTitle} from 'material-ui/Card';
import Moment from 'react-moment';

class RegistrationConf extends Component {
  constructor(props) {
    super(props);
    this.state ={
      registered: false,
    }
  };

  render() {
      return(
              <div className="registered">
                <Card className="successCard">
                  <div className="success">
                    <CardTitle>You have successfully registered</CardTitle>
                  </div>
                    <CardText>
                      <p>{this.props.audition.location}</p>
                      {/*TODO format date time how you like*/}
                      <p>Audition starts at <Moment format="YYYY/MM/DD HH:mm">{this.props.audition.time}</Moment></p>
                    </CardText>
                </Card>
                <Card className="successCard" id="regCard">
                  <div className="regNum">
                    <CardTitle><h3>You are number</h3> </CardTitle>
                    </div>
                    <CardText id="numArea">
                      <p id="number">{this.props.regNum}</p>
                    </CardText>
                </Card>
              </div>

      )
  }

}


export default RegistrationConf;