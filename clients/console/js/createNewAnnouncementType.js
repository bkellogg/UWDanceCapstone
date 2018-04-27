"use strict";

refreshLocalUser();
let auth = getAuth();

var newAnnouncementTypeForm = document.querySelector(".newAnnouncementType-form");
var errorBox = document.querySelector(".js-error");
var announcementTypeName = document.getElementById("announcementTypeName-input");
var description = document.getElementById("description-input");

getAnnouncementTypes()

newAnnouncementTypeForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    var payload = {
        "name": announcementTypeName.value,
        "desc": description.value,
    };
    console.log(payload)
    makeRequest("announcements/types", payload, "POST", true)
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
function getAnnouncementTypes() {
    fetch(API_URL_BASE + "announcements/types?includeDeleted=false&auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
              $("ul").append("<li>"+ value.name + "</li>")
            });
        })

}