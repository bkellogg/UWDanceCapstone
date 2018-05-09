"use strict";
refreshLocalUser();

const status = document.querySelector("#users")
let announcements = []

getAnnouncements();

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
                $('body').append("<div>" + value.message+ "</div>").addClass('announcements')
            });
        })
}
