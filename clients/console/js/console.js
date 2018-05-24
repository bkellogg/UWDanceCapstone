"use strict";

var welcomeArea = document.getElementById("welcome")
var signoutButton = document.querySelector(".js-signout-btn");

var welcome = document.createElement("p");
var user = [];

var announcements = [];


var shows = {};
var showTypes = [];
var finalShowInfo = [];


refreshLocalUser().then(() => {
    user = getLocalUser();
    welcome.textContent = "Welcome " + user.firstName + " " + user.lastName
    welcomeArea.appendChild(welcome);
});

getAnnouncements();


getActiveShows();
getShowTypes();


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
                $(".active-announcements").append('<div class="announcements" id="message">' + value.message + '</div>')
                $("#message").attr("id", value.id)
                $("#remove").attr("id", value.id)
            });
        })
}

// Get Active Shows
function getActiveShows() {
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
                show["Show Type"] = value.typeID;
                show["Audition ID"] = value.auditionID;
                shows[value.id] = show
            });
        })
}


// Get show types
function getShowTypes() {
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
}

// Get Audition info
function getAuditionInfo(auditionID) {
    makeRequest("auditions/" + auditionID, {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                console.log(value);
            });
        })
}

