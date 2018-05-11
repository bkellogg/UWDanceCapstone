"use strict";

let nameLoc = document.querySelector(".user-name-loc");
let bioContent = document.querySelector(".bio-content");

let userID = getQueryParam("user");
if (!userID) {
    // TODO HANDLE ME ===========
    console.error("TODO: HANLDE THIS CASE: no user to get");
}

let user;
makeRequest("users/" + userID, {}, "GET", true)
.then((res) => {
    if (res.ok) {
        return res.json();
    }
    return res.text().then((t) => Promise.reject(t));
})
.then((data) => {
    nameLoc.textContent = data.firstName + " " + data.lastName + " (" + data.role.displayName + ")";
    bioContent.textContent = data.bio;
})
.catch((error) => {
    console.error(error);
});