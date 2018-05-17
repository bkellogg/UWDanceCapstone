"use strict";

var resetForm = document.querySelector(".reset-form");
var errorBox = document.querySelector(".js-error");
var emailInput = document.getElementById("email-input");

resetForm.addEventListener("submit", function (evt) {
    errorBox.textContent = "";
    evt.preventDefault();
    makeRequest("passwordreset?email=" + emailInput.value, {}, "GET", false)
        .then(function (res) {
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