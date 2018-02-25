"use strict";

var resetForm = document.querySelector(".reset-form");
var errorBox = document.querySelector(".js-error");
var emailInput = document.getElementById("email-input");

resetForm.addEventListener("submit", function(evt) {
    errorBox.textContent = "";
    evt.preventDefault();
    fetch(API_URL_BASE + "passwordreset?email=" + emailInput.value)
        .then(function(res) {
            if (res.ok) {
                return res.text();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(function (data) {
            errorBox.textContent = data;
        })
        .catch(function (err) {
            errorBox.textContent = "ERROR: " + err;
        })
});