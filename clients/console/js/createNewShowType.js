"use strict";

refreshLocalUser();

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
    makeRequest("shows/types", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            alert("New show type successfully created.");
            $('input').val('');
            $('.newShowType-form')[0].reset();
        })
        .catch((err) => {
            errorBox.textContent = err;
        })
})


// get show types
function getShowTypes() {
    makeRequest("shows/types?includeDeleted-false", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                $("ul").append("<li>" + value.name + " - " + value.desc + "</li>")
            });
        })

}