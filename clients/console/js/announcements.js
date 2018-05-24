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
                var announcementInfo = [];
                announcementInfo.push('<div class="announcements" id=' + value.id + '>' + value.message + '</div>');
                announcementInfo.push('<button class="remove" id =' + value.id + ' onClick="deleteAnnouncement(this.id)">Remove</button>');
                announcements.push(announcementInfo);
            });
        })
        .then(() => {
            populateAnnouncementTable();
        })
}

function deleteAnnouncement(event) {
    makeRequest("announcements/" + event, {}, "DELETE", true)
        .then(() => {
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
    makeRequest("announcements/types", {}, "GET", true)
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

function populateAnnouncementTable() {
    var rows = []
    rows.push($.map(announcements, function (value, index) {
        return '<tr><td>' + value[0] + '</td><td>' + value[1] + '</td></tr>';
    }));
    $('#active-announcements').html(rows.join(''));
}