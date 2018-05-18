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
                user.push('<a href="userProfile.html?user=' + value.id + '">Profile</a>');
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
    $('#users_table').DataTable({
        "data": allUsers,
        "paging": false,
        "IDisplayLength": 25,
        "bFilter": false,
        "bInfo": false
    });
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


// https://{{url}}/api/v1/users/all?page=1&email=brendan6@uw.edu&fname=brendan&lname=kellogg