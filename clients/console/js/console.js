"use strict";

var content = document.querySelector(".content");

var createAuditionButton = document.querySelector(".js-create-audition");
var createAuditionForm = document.querySelector(".create-audition-form");

var createShowButton = document.querySelector(".js-create-show");
var createShowForm = document.querySelector(".create-show-form");

var createPieceButton = document.querySelector(".js-create-piece");
var createPieceForm = document.querySelector(".create-piece-form");

var signoutButton = document.querySelector(".js-signout-btn");
var refreshUserButton = document.querySelector(".js-refresh-user-btn");

var welcome = document.createElement("p");
var accountLink = document.createElement("a");
var user = {};

var auditionFormWrapper = $('.create-audition-form-wrapper');
auditionFormWrapper.hide();
var showFormWrapper = $('.create-show-form-wrapper');
showFormWrapper.hide();
var pieceFormWrapper = $('.create-piece-form-wrapper');
pieceFormWrapper.hide();

var auditionForm = $('.create-audition-form');

refreshLocalUser().then(() => {
    user = getLocalUser();
    welcome.textContent = "Welcome " + user.firstName + "! Your current access level is: " + user.role + ".";
    content.appendChild(welcome);
    accountLink.href = "account.html";
    accountLink.textContent = "Profile";
    content.appendChild(accountLink);
});

signoutButton.addEventListener("click", signout);
refreshUserButton.addEventListener("click", () => {
    refreshLocalUser().then(() => {
        user = getLocalUser();
        welcome.innerText = "Welcome " + user.firstName + "! Your current access level is: " + user.role + ".";
    })
});

createAuditionButton.addEventListener("click", () => {
    auditionFormWrapper.toggle();
});
createShowButton.addEventListener("click", () => {
    showFormWrapper.toggle();
});
createPieceButton.addEventListener("click", () => {
    pieceFormWrapper.toggle();
});
createAuditionForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    var resBox = $('.create-aud-res-box');
    var payload = {
        "name": $('#aud-name-input').val(),
        "date": $('#aud-date-input').val(),
        "time": $('#aud-time-input').val(),
        "location": $('#aud-location-input').val(),
        "quarter": $('#aud-quarter-input').val(),
        "year": parseInt($('#aud-year-input').val())
    };
    makeRequest("auditions", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return res.text().then((t) => Promise.reject(t));
            }
        })
        .then((data) => {
            resBox.text("Success! The new audition's ID is: " + data.id);
        })
        .catch((err) => {
            resBox.text("Failed to create audition: " + err);
        })
});

createShowForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    var resBox = $('.create-show-res-box');
    var payload = {
        "name": $('#show-name-input').val(),
        "auditionid": parseInt($('#show-audid-input').val())
    };
    makeRequest("shows", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return res.text().then((t) => Promise.reject(t));
            }
        })
        .then((data) => {
            resBox.text("Success! The new show's ID is: " + data.id);
        })
        .catch((err) => {
            resBox.text("Failed to create show: " + err);
        })
});

createPieceForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    var resBox = $('.create-piece-res-box');
    var payload = {
        "name": $('#piece-name-input').val(),
        "showID": parseInt($('#piece-showid-input').val())
    };
    makeRequest("pieces", payload, "POST", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                return res.text().then((t) => Promise.reject(t));
            }
        })
        .then((data) => {
            resBox.text("Success! The new show's ID is: " + data.id);
        })
        .catch((err) => {
            resBox.text("Failed to create show: " + err);
        })
});