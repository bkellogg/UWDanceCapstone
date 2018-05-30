"use strict";

refreshLocalUser();

var allUsers = [];

let pageNum = getQueryParam("page");
if (!pageNum) {
    pageNum = 1;
}

getUsers();

function getUsers() {
    makeRequest("users/all?page=" + pageNum + "&includeInactive=false", {}, "GET", true)
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
                user.push('<a class="profile-link" href="userProfile.html?user=' + value.id + '" target="_blank">Profile</a>');
                allUsers.push(user);
            });
        })
        .then(() => {
            populateUserTable(allUsers);
            if (pageNum > 1) {
                createPreviousLink(pageNum);
            }
            createNextLink(pageNum);
        })
}

function populateUserTable() {
    var rows = []
    rows.push('<tr data-sort-method="none">' + 
    '<th>ID</th>' + 
    '<th>First Name</th>' + 
    '<th>Last Name</th>' + 
    '<th>Email</th>' + 
    '<th>Role</th>' +
    '<th>View Profile</th></tr>')
    rows.push($.map(allUsers, function (value, index) {
        return '<tr><td>' + value[0] + '</td><td>' + value[1] +
            '</td><td>' + value[2] + '</td><td>' + value[3] +
            '</td><td>' + value[4] + '</td><td>' + value[5] +
            '</td><td></tr>';
    }));
    $('#users_table').html(rows.join(''));
    new Tablesort(document.getElementById('users_table'));
}


function createNextLink(pageNum) {
    var nextPage = document.createElement("a");
    var linkText = document.createTextNode("Next");
    nextPage.appendChild(linkText);
    nextPage.setAttribute("id", "next");
    nextPage.href = "getUsers.html?page=" + (Number(pageNum) + 1);
    document.body.appendChild(nextPage);
}

function createPreviousLink(pageNum) {
    var prevPage = document.createElement("a");
    var linkText = document.createTextNode("Prev");
    prevPage.appendChild(linkText);
    prevPage.setAttribute("id", "previous");
    prevPage.href = "getUsers.html?page=" + (Number(pageNum) - 1);
    document.body.appendChild(prevPage);
}
