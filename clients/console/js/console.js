"use strict";

var header = document.querySelector(".header")
var signoutButton = document.querySelector(".js-signout-btn");

var welcome = document.createElement("p");
var accountLink = document.createElement("a");
var user = {};


refreshLocalUser().then(() => {
    user = getLocalUser();
    welcome.textContent = "Welcome " + user.firstName
    header.appendChild(welcome);
    accountLink.href = "account.html";
    accountLink.textContent = "Profile";
});

signoutButton.addEventListener("click", signout);

$(".has-submenu ul").hide();
$(".has-submenu > a").click(function() {
    $(this).next("ul").toggle();
});
