import React, { Component } from 'react';
import './styling/AvailabilityOverlap.css';
import './styling/CastingFlow.css';

const daysRef = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] //TODO make audition match this CRYYYY

const timesRef = ["1000", "1030", "1100", "1130", "1200", "1230", "1300", "1330", "1400", "1430",
  "1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100"]

const timesFormatted = ["", "10:00 AM", "", "11:00 AM", "", "12:00 PM", "", "1:00 PM", "", "2:00 PM", "", "3:00 PM", "", "4:00 PM", "",
  "5:00 PM", "", "6:00 PM", "", "7:00 PM", "", "8:00 PM", "", "9:00 PM"]


const colors = ["#fff", "#9ABB3E", "#CC66AD", "#2B823D", "#6640BF", "#C8BA5B", "#7A2932", "#260D0D"]

const dayTimesRef = [
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ],
  [
    [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
  ]
]

class AvailabilityOverlap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredCast: this.props.filteredCast,
      dayTimes: [
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ]
      ]
    };
  };

  componentDidMount() {
    console.log(this.props)
    this.setState({
      dayTimes : this.getAllDancerOverlap(this.props.filteredCast)
    })
  }

  componentWillReceiveProps(props){
    this.setState({
      cast: props.cast,
      filteredCast: props.filteredCast,
      dayTimes : this.getAllDancerOverlap(props.filteredCast)
    })
  }

  flushDayTimes = () => {
    let dayTimes = this.state.dayTimes
    let newWeek = []
    dayTimes.map(days => { 
      newWeek.push([[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []])
    })
    return newWeek
  }

  getAllDancerOverlap = (filteredCast) => {
    
    let dayTimes = this.flushDayTimes()

    this.props.cast.map((dancer, i) => { //go through each dancer

      let days = dancer.dancer.availability.days
      let id = dancer.dancer.user.id
      if(filteredCast.indexOf(id) >= 0) {
      
        days.map((day, j) => { //j will match the index of this.state.dayTimes & daysRef, it is the day for each dancer's schedule
          let times = day.times

          times.map((time, k) => { //times is the array of times for that day

            let startIndex = timesRef.indexOf(time.start)
            let endIndex = timesRef.indexOf(time.end)

            //okay so for the times in timesRef it works,but brendan put times in that aren't in our calendar
            //which is fine, but it means I am going to ignore times that aren't in our window, so when index = -1
            if (startIndex < 0 || endIndex < 0) {
              return
            }
            //moving on
            //now we only have valid start/end times and their location 
            let incrementIndex = startIndex //increment index is the index of our this.state.dayTimes[j][incrementIndex]

            while (incrementIndex !== (endIndex + 1)) { //plus one added to include the end index
              let currPlace = dayTimes[j][incrementIndex]
              currPlace.push(id)
              incrementIndex++
            }

          })
        })
      }
    })
    //just going to go through contested dancers again because I am tired and lazy
    if(this.props.contested) {
      this.props.contested.map((dancer, i) => { //go through each dancer
        let days = dancer.rankedDancer.dancer.availability.days
        let id = dancer.rankedDancer.dancer.user.id
        if(filteredCast.indexOf(id) >= 0) {
        
          days.map((day, j) => { //j will match the index of this.state.dayTimes & daysRef, it is the day for each dancer's schedule
            let times = day.times

            times.map((time, k) => { //times is the array of times for that day

              let startIndex = timesRef.indexOf(time.start)
              let endIndex = timesRef.indexOf(time.end)

              //okay so for the times in timesRef it works,but brendan put times in that aren't in our calendar
              //which is fine, but it means I am going to ignore times that aren't in our window, so when index = -1
              if (startIndex < 0 || endIndex < 0) {
                return
              }
              //moving on
              //now we only have valid start/end times and their location 
              let incrementIndex = startIndex //increment index is the index of our this.state.dayTimes[j][incrementIndex]

              while (incrementIndex !== (endIndex + 1)) { //plus one added to include the end index
                let currPlace = dayTimes[j][incrementIndex]
                currPlace.push(id)
                incrementIndex++
              }

            })
          })
        }
      })
    }

    this.setState({
      dayTimes : dayTimes
    })

    return dayTimes
  }

  render() {
    console.log(this.props)
    const dayTimes = this.state.dayTimes

    //generate the overlap days from the state
    let overlapDays = dayTimes.map((days, i) => {

      let overlapTimes = days.map((times, j) => {
        let color = colors[times.length]

        //because I suck, we're going to reduce down to all the unique IDS in the array
        let uniqueIDs = [...new Set(times)];
        color = colors[uniqueIDs.length] 
        //this is the div with the specific time block
        return (
          <div className="overlapTimes" style={{ "backgroundColor": color }}>
            {timesRef[j]}
          </div>
        )
      })
      //this is the div for the day, that contains all the time blocks
      return (
        <div className="overlapDays">
          {overlapTimes}
        </div>
      )
    })
    //generates the days header
    let daysSimple = daysRef.map((day, i) => {
      return (
        <div className="daysSimple">
          {day}
        </div>
      )
    })
    //generates the times displayed on the side
    let timesSimple = timesFormatted.map((time, i) => {
      return (
        <div className="timesSimple">
          {time}
        </div>
      )
    })

    return (
      <section>
        <h2 className="smallHeading">Availability</h2>
        <div className="availabilityCalendar">
          <div className="calendarWrap">
            <div className="timesRow">
              {timesSimple}
            </div>
            <div className="timeBlock">
              <div className="daysHeader">
                {daysSimple}
              </div>
              <div className="times">
                {overlapDays}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

}
export default AvailabilityOverlap;



/*Logic:

We have an array of days [0 = sunday, 1 = monday, ect.]
Inside of each day we have an array of times [0 = 1000, 1 = 1030, ect]
Inside of each day we have an array of dancers who are UNAVAILABLE at that time (per their audition info) [uid, uid, uid]

To make the thing, we go 
for each day, denote a div
for each time, make a div inside that div
for each dancer in that time, increase the color intensity

return the day div with smaller divs inside of it

when someone wants to filter, we remake the whole thing? or we make one with everyone in it, store it permanently, and then 
when they want to filter we simply remove all instances of that person from the thing

if they want to add someone back, we can use the master one and just remove everyone who isn't checked (so like have an
array of selected dancers, and remove everyone not in that list)


to make it in the first place, we have each dancer with an availability blob that is an array of days
each day has an array of times
each time is an object with a start and end time, and they aren't guaranteed to be in order

so we go for each day
for each time 
add their UID to the corresponding array

so for each day, for each time, starting at the start time of the first time
go through the dayTimes at that day and add the uid to the array while the end time != end time of the dancer


then based on the length of the time array, generate the colors

*/


