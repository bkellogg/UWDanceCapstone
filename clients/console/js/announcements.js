"use strict";
refreshLocalUser();

var announcements = [];

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
                $(".active-announcements").append('<div class="announcements" id="message">' + value.message + '<button class="remove" id ="remove" onClick="deleteAnnouncement(this.id)">Remove</button></div>')
                $("#message").attr("id", value.id)
                $("#remove").attr("id", value.id)
            });
        })
}

function deleteAnnouncement(event) {
    makeRequest("announcements/" + event, {}, "DELETE", true)
        .then(() =>{
            location.reload();
        })
}