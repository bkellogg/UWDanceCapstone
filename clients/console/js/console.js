"use strict";

var welcomeArea = document.getElementById("welcome")
var signoutButton = document.querySelector(".js-signout-btn");

var welcome = document.createElement("p");
var accountLink = document.createElement("a");
var user = {};


refreshLocalUser().then(() => {
    user = getLocalUser();
    welcome.textContent = "Welcome " + user.firstName + " " + user.lastName
    welcomeArea.appendChild(welcome);
    accountLink.href = "account.html";
    accountLink.textContent = "Profile";
});

$(".has-submenu ul").hide();
$(".has-submenu > a").click(function() {
    $(this).next("ul").toggle();
});
