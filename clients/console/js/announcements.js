"use strict";

const status = document.querySelector("#users")
let auth = getAuth();
let announcements = []

refreshLocalUser();

getAnnouncements();


// get all active announcements
function getAnnouncements() {
    fetch(API_URL_BASE + "/announcements?includeDeleted=false&auth=" + auth)
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
