"use strict";

let API_URL_BASE = "https://dasc.capstone.ischool.uw.edu/api/v1"

let userCountField = document.querySelector(".add-users-count");
let addUsersButton = document.querySelector(".add-users-btn");

addUsersButton.addEventListener("click", (evt) => {
    evt.preventDefault();
    var numUsersAdded = 0;
    var numUsersFailed = 0;
    let userCount = parseInt(userCountField.value);
    staggerAdds(userCount, 10);
    //alert("user add cycle completed with " + numUsersAdded + " successes and " + numUsersFailed + " failures");
})

function staggerAdds(numAdds, maxConcurrent) {
    let totalCompleted = 0;
    let numRunning = 0;
    for (let i = 0; i < Math.min(numAdds, maxConcurrent); i++) {
        var addRepeater = function() {
            numRunning++;
            addUser().then(() => {
                numRunning--;
                totalCompleted++;
                if (numRunning < maxConcurrent && totalCompleted < numAdds) {
                    addRepeater();
                }
            });
        }
        addRepeater();
    }
}

// addUser adds a single user
function addUser() {
    let payload = JSON.stringify({
        "firstName": chance.first(),
        "lastName": chance.last(),
        "email": chance.email(),
        "password": "password",
        "passwordConf": "password"
    });
    let headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Content-Length", payload.length);
    return fetch(API_URL_BASE + "/users", {
        method: "POST",
        headers: headers,
        body: payload
    })
    .then((res) => {
        if (res.ok) {
            console.log("user added");
        } else {
            return res.text().then((t) => Promise.reject(t));
        }
    })
    .catch((err) => {
        console.error(err);
    })
}