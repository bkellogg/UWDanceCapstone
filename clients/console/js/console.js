"use strict";

var content = document.querySelector(".content");
var signoutButton = document.querySelector(".js-signout-btn");

var welcome = document.createElement("p");
var accountLink = document.createElement("a");
var user = {};

refreshLocalUser().then(() => {
    user = getLocalUser();
    accountLink.href = "account.html";
    accountLink.textContent = "Profile";
    content.appendChild(accountLink);
});

signoutButton.addEventListener("click", signout);
