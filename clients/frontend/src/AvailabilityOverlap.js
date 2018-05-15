import React, { Component } from 'react';
import './styling/AvailabilityOverlap.css';
import './styling/CastingFlow.css';

const daysRef = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] //TODO make audition match this CRYYYY

const timesRef = ["1000", "1030", "1100", "1130", "1200", "1230", "1300", "1330", "1400", "1430",
  "1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100", "2130", "2200", "2230"]

const timesFormatted = ["", "10:00 AM", "", "11:00 AM", "", "12:00 PM", "", "1:00 PM", "", "2:00 PM", "", "3:00 PM", "", "4:00 PM", "",
  "5:00 PM", "", "6:00 PM", "", "7:00 PM", "", "8:00 PM", "", "9:00 PM", "", "10:00 PM", ""]


//const colors = ["#fff", "#9ABB3E", "#CC66AD", "#2B823D", "#6640BF", "#C8BA5B", "#7A2932", "#260D0D"] visually distinct, helpful for debugging
//const colors = ["#fff", "#D6E0F5", "#ADC2EB", "#85A3E0", "#5C85D6", "#3366CC", "#2952A3", "#1F3D7A", "#142952"]

const colors = ["fff", "#f1f5fc", "#e3eaf8", "#d6e0f5", "#c8d6f2", "#baccee", "#adc2eb", "#9fb8e8", 
"#91aee4", "#84a3e1", "#7699de", "#688fda", "#5b85d7", "#4d7bd4", "#4071d0", "#3266cd", "#2f60bf", "#2b59b2", "#2852a4", 
"#254b96", "#214489", "#1e3d7b", "#1b376d", "#173060", "#142952", "#124", "#0d1b37", "#0a1529", "#070e1b", "#03070e", "#000"]

class AvailabilityOverlap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredCast: this.props.filteredCast,
      maxCast: this.props.filteredCast,
      dayTimes: [
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ],
        [
          [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []
        ]
      ]
    };
  };

  componentWillMount() {
    this.setState({
      dayTimes: this.getAllDancerOverlap(this.props.filteredCast)
    })
  }

  componentWillReceiveProps(props) {
    this.setState({
      cast: props.cast,
      filteredCast: props.filteredCast,
      dayTimes: this.getAllDancerOverlap(props.filteredCast)
    })
  }

  flushDayTimes = () => {
    let dayTimes = this.state.dayTimes
    let newWeek = []
    dayTimes.map(days => {
      newWeek.push([[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], []])
      return newWeek
    })
    return newWeek
  }

  getAllDancerOverlap = (filteredCast) => {

    let dayTimes = this.flushDayTimes()

    this.props.cast.map((dancer, i) => { //go through each dancer

      let days = dancer.dancer.availability.days
      let id = dancer.dancer.user.id
      let firstName = dancer.dancer.user.firstName
      if (filteredCast.indexOf(id) >= 0 && days !== undefined) { //check to see that they are in the filtered cast and did have an availability

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
              currPlace.push({"id" : id, "name" : firstName})
              incrementIndex++
            }
            return incrementIndex //arbitrary
          })
          return times //arbitrary
        })
      }
      return days //arbitrary
    })
    //just going to go through contested dancers again because I am tired and lazy
    if (this.props.contested) {
      this.props.contested.map((dancer, i) => { //go through each dancer
        let days = dancer.rankedDancer.dancer.availability.days
        let id = dancer.rankedDancer.dancer.user.id
        let firstName = dancer.rankedDancer.dancer.user.firstName
        if (filteredCast.indexOf(id) >= 0  && days !== undefined) {

          days.map((day, j) => { //j will match the index of this.state.dayTimes & daysRef, it is the day for each dancer's schedule
            let times = day.times

            times.map((time, k) => { //times is the array of times for that day

              let startIndex = timesRef.indexOf(time.start)
              let endIndex = timesRef.indexOf(time.end)

              // I am going to ignore times that aren't in our window, so when index = -1
              if (startIndex < 0 || endIndex < 0) {
                return
              }
              //moving on
              //now we only have valid start/end times and their location 
              let incrementIndex = startIndex //increment index is the index of our this.state.dayTimes[j][incrementIndex]

              while (incrementIndex !== (endIndex + 1)) { //plus one added to include the end index
                let currPlace = dayTimes[j][incrementIndex]
                currPlace.push({"id" : id, "name" : firstName})
                incrementIndex++
              }
              return incrementIndex //arbitrary return for linting
            })
            return times //arbitrary
          })
        }
        return days //arbitrary
      })
    }

    this.setState({
      dayTimes: dayTimes
    })

    this.calculateMaxCast(dayTimes)

    return dayTimes
  }

  calculateMaxCast = (dayTimes) => {
    let max = 0
    dayTimes.forEach((day, i) => {// go through each day
      day.forEach((time, j) => {
        let uniqueIDs = [...new Set(time)];
        if (uniqueIDs.length > max) {
          max = uniqueIDs.length
        }
      })
    })
    this.setState({
      maxCast : max
    })
  }

  render() {
    const dayTimes = this.state.dayTimes

    //generate the overlap days from the state
    let overlapDays = dayTimes.map((days, i) => {

      let overlapTimes = days.map((times, j) => {
        let color = colors[times.length]

        //because I suck, we're going to reduce down to all the unique IDS in the array
        let uniqueIDs = [...new Set(times)];
        if (uniqueIDs.length < colors.length) { //if the number of unique IDs is equal to or less than the number of colors we have, it gets a unique color
          color = colors[uniqueIDs.length]
        } else { //otherwise it is getting the color at the end of the list
          color = colors[colors.length - 1]
        }

        let names = uniqueIDs.map((dancer, i) => {
          return (
           <div key={i}>{dancer.name}</div>
          )
        })

        //this is the div with the specific time block
        return (
          <div className="tooltip" key={j}>
            <div className="overlapTimes" style={{ "backgroundColor": color }}>
              {
                names.length > 0 &&
                <span className="tooltiptext">{names}</span>
              }
            </div>
          </div>
        )
      })
      //this is the div for the day, that contains all the time blocks
      return (
        <div key={i} className="overlapDays">
          {overlapTimes}
        </div>
      )
    })
    //generates the days header
    let daysSimple = daysRef.map((day, i) => {
      return (
        <div key={i} className="daysSimple">
          {day}
        </div>
      )
    })
    //generates the times displayed on the side
    let timesSimple = timesFormatted.map((time, i) => {
      return (
        <div key={i} className="timesSimple">
          {time}
        </div>
      )
    })

    let midColor = Math.round(this.state.maxCast / 2)

    return (
      <section>
        <div className="overlapAvailability">
          <div className="cardTitleWrap">
            <div className="headerWrap">
              <h2 className="smallHeading">Availability</h2>
            </div>
            <div className="legend">
              <p className="colorIndicator">1 available</p>
              <div className="colorsWrap">
                <div className="lightLegendColor" style={{ "backgroundColor": colors[1] }}> </div>
                <div className="mediumLegendColor" style={{ "backgroundColor": colors[midColor] }}> </div>
                <div className="darkLegendColor" style={{ "backgroundColor": colors[this.state.maxCast] }}> </div>
              </div>
              <p className="colorIndicator">{this.state.maxCast} Available</p>
            </div>
          </div>
          <div className="availabilityCalendar">
            <div className="timesRow">
              {timesSimple}
            </div>
            <div className="timeBlock">
              <div className="daysHeader">
                {daysSimple}
              </div>
              <div className="overlapTimes">
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


