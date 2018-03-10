import React, { Component } from 'react';
import TableDragSelect from "react-table-drag-select";
import "react-table-drag-select/style.css";
import './styling/Availability.css'

class Availability extends Component {
    constructor(props){
        super(props);
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

    render() {
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