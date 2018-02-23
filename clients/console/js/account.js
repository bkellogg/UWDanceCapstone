"use strict";

refreshLocalUser();

let user = getLocalUser();
let auth = getAuth();

let content = document.querySelector(".content");
let photoForm = document.querySelector(".change-photo-form");
let bioForm = document.querySelector(".change-bio-form");
let bioContent = document.querySelector(".bio-content");
let bioInput = document.querySelector("#bio-input");
let imgLoc = document.querySelector(".image-loc");

let name = document.createElement("p");
name.textContent = "Welcome " + user.firstName;
content.appendChild(name);

if (!user.bio) {
    bioContent.textContent = "You have no bio.";
} else {
    bioContent.textContent = user.bio;
}

getImage();

photoForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    let file = document.querySelector("#photo-selector");
    let data = new FormData();
    data.append("image", file.files[0]);

    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    let photoResult = document.querySelector(".photo-result");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                photoResult.textContent = xhr.responseText;
                getImage();
            } else {
                photoResult.textContent = "ERROR: " + xhr.responseText;
            }
        }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/1/photo");
    xhr.setRequestHeader("Authorization", auth);
    xhr.setRequestHeader("ImageFieldName", "image");

    xhr.send(data);
});

bioForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    let bioRes = document.querySelector(".bio-result");
    let payload = {
        "bio": bioInput.value
    };
    makeRequest("users/me", payload, "PATCH", true)
        .then((res) => {
            if (res.ok) {
                return
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(() => {
            refreshLocalUser().then(() => {
                user = getLocalUser();
                bioContent.textContent = user.bio;
            })
        })
        .catch((err) => {
            bioRes.textContent = "ERROR: " + err;
        })
});

function getImage() {
    let image = document.querySelector(".profile-picture");
    if (!image) {
        image = document.createElement("img");
        image.classList.add("profile-picture");
        imgLoc.appendChild(image);
    }
    fetch(API_URL_BASE + "users/me/photo?auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.blob();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            image.src = URL.createObjectURL(data);
        })
        .catch((err) => {
            let p = document.createElement("p");
            p.textContent = "image unavailable: " + err;
            content.appendChild(p);
        });

}