"use strict";

vex.defaultOptions.className = 'vex-theme-default';
var resetForm = document.querySelector(".reset-form");
var errorBox = document.querySelector(".js-error");
var emailInput = document.getElementById("email-input");

resetForm.addEventListener("submit", function (evt) {
    errorBox.textContent = "";
    evt.preventDefault();
    makeRequest("passwordreset?email=" + emailInput.value, {}, "GET", false)
        .then(function (res) {
            if (res.ok) {
                vex.dialog.alert("Password reset instructions sent to the provided email address.");
                $('.reset-form')[0].reset();
                return res.text();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .catch(function (err) {
            errorBox.textContent = "ERROR: " + err;
        })
});