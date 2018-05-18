"use strict";

refreshLocalUser();

let searchForm = document.querySelector(".search-users-form");
var errorBox = document.querySelector(".js-error");
var fname = document.getElementById("fname-input");
var lname = document.getElementById("lname-input");
var email = document.getElementById("email-input");

var allUsers = [];

populateUserTable2();

searchForm.addEventListener("submit", function (evt) {
    allUsers = [];
    evt.preventDefault();
    makeRequest("users/all?email=" + email.value + "&fname=" + fname.value + "&lname=" + lname.value, {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data.users).each(function (index, value) {
                var user = [];
                user.push(value.id);
                user.push(value.firstName);
                user.push(value.lastName);
                user.push(value.email);
                user.push(value.role.displayName);
                user.push('<a href="userProfile.html?user=' + value.id + '">Profile</a>');
                allUsers.push(user);
            });
        })
        .then(() => {
            populateUserTable2();
            $('input').val('');
            $('.search-users-form')[0].reset();
        })
})

function populateUserTable2() {
    var tbl = $('#users_table').DataTable();
    tbl.clear()
    tbl.rows.add(allUsers);
    tbl.draw();
}