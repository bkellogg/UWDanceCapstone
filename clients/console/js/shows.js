"use strict";

var shows = [];
var showTypes = [];

getActiveShows();

// Get Active Shows
function getActiveShows() {
    makeRequest("shows/types?includeDeleted=false", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                showTypes[value.id] = value.desc;
            });
        })
        .then(() => {
            makeRequest("shows", {}, "GET", true)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return res.text().then((t) => Promise.reject(t));
                })
                .then((data) => {
                    var showInfo = data.shows
                    $(showInfo).each(function (index, value) {
                        var show = {};
                        show["showID"] = value.id
                        show["showType"] = value.typeID;
                        show["auditionID"] = value.auditionID;
                        shows.push(show);
                    });
                })
                .then(() => {
                    $(shows).each(function (index, value) {
                        value["showName"] = showTypes[value.showType];
                    });
                })
                .then(() => {
                    $(shows).each(function (index, value) {
                        getAuditionInfo(value.auditionID, index);
                    })
                })
        })
}



// Get Audition info
function getAuditionInfo(auditionID, index) {
    makeRequest("auditions/" + auditionID, {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            shows[index]["auditionTime"] = data.time;
            shows[index]["location"] = data.location;
        })
        .then(() => {
            var auditionDay = moment(shows[index].auditionTime).format('MMM. Do, YYYY');
            var auditionTime = moment(shows[index].auditionTime).utcOffset('-0700').format("hh:mm a");
            var showName = shows[index].showName;
            var location = shows[index].location;
            var showID = shows[index].showID

            $(".active-shows").append('<div class="active-shows-card" id=' + index + '><p>'
                + showName + '</p><p>Audition Information</p><p>Date: ' + auditionDay + '</p><p>Time: ' +
                auditionTime + '</p><p>Location: ' + location + '</p><button class="delete" id =' +
                showID + ' onClick="deleteShow(this.id)">Delete Show</button></div>')
        })
}

function deleteShow(event) {
    makeRequest("shows/" + event, {}, "DELETE", true)
        .then(() => {
            location.reload();
        })
}