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

// Load pages 

function load_getUsers() {
    document.getElementById("content").innerHTML = '<object type="text/html" data="getUsers.html"></object>';
}

function load_createNewUser() {
    document.getElementById("content").innerHTML = '<object type="text/html" data="createNewUser.html"></object>';
}

function load_createNewUserRole() {
    document.getElementById("content").innerHTML = '<object type="text/html" data="createNewUserRole.html"></object>';
}

function load_profile() {
    document.getElementById("content").innerHTML = '<object type="text/html" data="account.html"></object>';
}

