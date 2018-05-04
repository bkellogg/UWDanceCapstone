"use strict";

refreshLocalUser();
let auth = getAuth();

var newShowTypeForm = document.querySelector(".newShowType-form");
var errorBox = document.querySelector(".js-error");
var showTypeName = document.getElementById("showTypeName-input");
var description = document.getElementById("description-input");

getShowTypes()

newShowTypeForm.addEventListener("submit", function (evt) {
    evt.preventDefault();
    var payload = {
        "name": showTypeName.value,
        "desc": description.value,
    };
    console.log(payload)
    makeRequest("shows/types", payload, "POST", true)
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


// get show types
function getShowTypes() {
    fetch(API_URL_BASE + "shows/types?includeDeleted=false&auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
              $("ul").append("<li>"+ value.name + " - " + value.desc + "</li>")
            });
        })

}