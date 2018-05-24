"use strict";
refreshLocalUser();

var announcementForm = document.querySelector(".announcement-form");
var errorBox = document.querySelector(".js-error");
var announcementType = document.getElementById("announcementType");
var message = document.getElementById("announcement-message-input");

var announcementButton = document.querySelector(".create-new-announcement");

var announcements = [];

getAnnouncements();
populateAnnouncementTypeOptions();

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

announcementForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    var payload = {
        "type": announcementType.value,
        "message": message.value,
    };
    makeRequest("announcements", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            location.reload();
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})

// get announcement types
function populateAnnouncementTypeOptions() {
    makeRequest("announcements/types",{}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options;
            $(data).each(function (index, value) {
                options += '<option value="' + value.name + '">' + value.name + '</option>';
            });
            $('#announcementType').html(options);
        })

}