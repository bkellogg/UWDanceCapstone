import React, { Component } from 'react';
import TableDragSelect from "react-table-drag-select";
import "react-table-drag-select/style.css";
import './styling/Availability.css'

const times = ["1000", "1030","1100","1130","1200","1230","1300", "1330", "1400","1430", 
"1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100"]

const days = ["mon", "tues", "wed", "thurs", "fri", "sat", "sun"]

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
                [false, false, false, false, false, false, false, false]
              ]
          };
    }

    handleChange = cells => this.setState({ cells });

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
        [false, false, false, false, false, false, false, false]]
      
        this.setState({ cells });

    };

    calculateTimes(){
      //the first for each gives us the TIMES
      this.state.cells.forEach(time => {
        time.forEach(day =>{
          
        })
      });

      //we can skip 0 because the first row is always going to be false
      //lets do this
      //{day: [{times}{times}{times}]
      let availability = {"mon":[]};
      for(let i = 1; i <= times.length; i++){
        for(let j = 1; j <= days.length; j++){
          if(this.state.cells[i][j]){
            if(availability[days[j-1]] == null){
              let timeSlot = []
              availability[days[j-1]] = timeSlot
            }
            availability[days[j-1]].push(times[i - 1])
          }
        }
      }
      console.log(availability) 
    }

    render() {
      this.calculateTimes()
        return(
            <div>
                <div className="table">
      <TableDragSelect value={this.state.cells} onChange={this.handleChange}>
        <tr>
          <td disabled />
          <td disabled>Monday</td>
          <td disabled>Tuesday</td>
          <td disabled>Wednesday</td>
          <td disabled>Thursday</td>
          <td disabled>Friday</td>
          <td disabled>Saturday</td>
          <td disabled>Sunday</td>
        </tr>
        <tr>
          <td disabled>10:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>11:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>12:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>13:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>14:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>15:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>16:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>17:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>18:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>19:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>20:00</td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled></td>
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
          <td />
        </tr>
        <tr>
          <td disabled>21:00</td>
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