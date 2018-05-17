import React, { Component } from 'react';

//styling
import TableDragSelect from "react-table-drag-select";
import "react-table-drag-select/style.css";
import './styling/Availability.css'

const times = ["1000", "1030","1100","1130","1200","1230","1300", "1330", "1400","1430", 
"1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100", "2130", "2200", "2230"]

const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"]

const daysRef = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

class Availability extends Component {
    constructor(props){
        super(props);
        this.calculateTimes = this.calculateTimes.bind(this)
        this.state = {
            cells: [
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false],
                [false, false, false, false, false, false, false, false]
              ]
          };
    }

    componentWillMount(){
      this.populateAvailability()
    }

    handleChange = cells => {
      this.setState({ cells })
      this.calculateTimes()
      this.props.availability(this.state.availability)
    };

    handleClick = () => {
      const cells = 
        [[false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false],
        [false, false, false, false, false, false, false, false]
      ]
      
        this.setState({ cells });

    };

    calculateTimes(){ 
      //we can skip 0 because the first row is always going to be false
      let a = []
      for(let i = 1; i <= times.length; i++){
        for(let j = 1; j <= days.length; j++){
          let dayVal = days[j - 1]
          let timeVal = times[i - 1]
          let endTime = (parseInt(timeVal, 10) + 30).toString()
          if (endTime[2] === "6"){
            let end = (parseInt(endTime.substring(0,2), 10) + 1).toString()
            endTime = end + "00"
          }
          //another bug?
          if(this.state.cells[i]){
            if(this.state.cells[i][j]){
              let dayExists = false;
              let dayLocation = 0;
              a.forEach((d, i) => {
                if (d.day === dayVal){
                  dayExists = true
                  dayLocation = i
                }
              })
              if (dayExists){
                let currEndTime = a[dayLocation].times[a[dayLocation].times.length - 1].end
                if (currEndTime === timeVal){
                  a[dayLocation].times[a[dayLocation].times.length - 1].end = endTime
                } else {
                  //this is where the bug is - cannot read property push of undefined
                  if(a[dayLocation].time !== undefined) {
                    a[dayLocation].time.push({
                      "start" : timeVal,
                      "end" : endTime
                    })
                  }
                }
              } else {
                a.push({
                  "day" : dayVal,
                  "times" : [{"start" : timeVal, "end": endTime}]
                })
              }
            }
          }
        }
      }
      this.setState({
        availability : a
      })
    }

    populateAvailability = () => {
      let cells = this.state.cells
      if (this.props.currAvailability) {
        if (this.props.currAvailability.days !== undefined) {//make sure they have an availability
          this.props.currAvailability.days.forEach(day => {
            let dayIndex = daysRef.indexOf(day.day)
            day.times.forEach(time => {
              let startIndex = times.indexOf(time.start)
              let endIndex = times.indexOf(time.end)
              if (startIndex > -1 && endIndex > -1) { //both times are within our timesRef
                let index = startIndex
                while (index < endIndex) {
                  //first row and first value in each row are labels - do not modify
                  cells[index + 1][dayIndex + 1] = true
                  index++
                }
              }
            })
          })
        }
      }
      this.setState({
        cells : cells
      })
    }

    render() {
        return(
            <div>
                <div className="availabilityTableDragDown">
      <TableDragSelect value={this.state.cells} onChange={this.handleChange}>
        <tr className="availabilityRow">
          <td disabled />
          <td disabled>Monday</td>
          <td disabled>Tuesday</td>
          <td disabled>Wednesday</td>
          <td disabled>Thursday</td>
          <td disabled>Friday</td>
          <td disabled>Saturday</td>
          <td disabled>Sunday</td>
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">10:00AM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">11:00AM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel"></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">12:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">1:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">2:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel"></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">3:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">4:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel"></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">5:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel"></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">6:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">7:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">8:00PM </td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">9:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr className="availabilityRow">
          <td disabled className="timeLabel">10:00PM</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
      </TableDragSelect>
      </div>
    </div>
        );
    };

};

export default Availability