"use strict";
refreshLocalUser();
let auth = getAuth();

var announcementForm = document.querySelector(".announcement-form");
var errorBox = document.querySelector(".js-error");
var announcementType = document.getElementById("announcementType");
var message = document.getElementById("announcement-message-input");



populateAnnouncementTypeOptions();


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
    fetch(API_URL_BASE + "announcements/types?includeDeleted=false&auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options = '<option value=""><strong>Announcement Type</strong></option>';
            $(data).each(function (index, value) {
                options += '<option value="' + value.name + '">' + value.name + '</option>';
            });
            $('#announcementType').html(options);
        })

}