"use strict";

var welcomeArea = document.getElementById("welcome")
var signoutButton = document.querySelector(".js-signout-btn");

var welcome = document.createElement("p");
var user = [];

var announcements = [];

var shows = [];
var showTypes = [];

refreshLocalUser().then(() => {
    user = getLocalUser();
    welcome.textContent = "Welcome " + user.firstName + " " + user.lastName
    welcomeArea.appendChild(welcome);
});

getAnnouncements();
getActiveShows();

// get all active announcements
function getAnnouncements() {
    makeRequest("announcements", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data.announcements).each(function (index, value) {
                $(".active-announcements").append('<div class="announcements dashboardAnnouncement" id="message">' + value.message + '<p style=color:grey;>' + value.createdBy.firstName + ' ' + value.createdBy.lastName + ', ' + moment(value.createdAt).format("MM/DD/YY hh:mm A") + '</p></div>')
                $("#message").attr("id", value.id)
                $("#remove").attr("id", value.id)
            });
        })
}

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
            makeRequest("shows?history=current", {}, "GET", true)
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
                .then((res) => {
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

            $(".active-shows").append('<div class="active-shows-card" id=' + index + '><h2 class="showName">' 
            + showName + '</h2><p>Audition Information</p><p>Date: ' + auditionDay + '</p><p>Time: ' + 
            auditionTime + '</p><p>Location: ' + location + '</p></div>')
        })
}
