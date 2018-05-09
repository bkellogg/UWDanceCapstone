"use strict";

refreshLocalUser();

let user = getLocalUser();

let content = document.querySelector(".content");
let photoForm = document.querySelector(".change-photo-form");
let bioForm = document.querySelector(".change-bio-form");
let bioContent = document.querySelector(".bio-content");
let bioInput = document.querySelector("#bio-input");
let resumeForm = document.querySelector(".upload-resume-form");
let imgLoc = document.querySelector(".image-loc");

var photoButton = document.querySelector(".js-upload-profile-photo");
var bioButton = document.querySelector(".js-change-bio");
var resumeButton = document.querySelector(".js-upload-resume");

var changePhotoFormWrapper = $('.change-photo-form');
changePhotoFormWrapper.hide();
var changeBioFormWrapper = $('.change-bio-form');
changeBioFormWrapper.hide();
var uploadResumeFormWrapper = $('.upload-resume-form');
uploadResumeFormWrapper.hide();

photoButton.addEventListener("click", () => {
    changePhotoFormWrapper.toggle();
    if ($('.change-bio-form').is(':visible')) {
        changeBioFormWrapper.toggle();
    } if ($('.upload-resume-form').is(':visible')) {
        uploadResumeFormWrapper.toggle();
    }
});
bioButton.addEventListener("click", () => {
    changeBioFormWrapper.toggle();
    if ($('.change-photo-form').is(':visible')) {
        changePhotoFormWrapper.toggle();
    } if ($('.upload-resume-form').is(':visible')) {
        uploadResumeFormWrapper.toggle();
    }
});
resumeButton.addEventListener("click", () => {
    uploadResumeFormWrapper.toggle();
    if ($('.change-bio-form').is(':visible')) {
        changeBioFormWrapper.toggle();
    } if ($('.change-photo-form').is(':visible')) {
        changePhotoFormWrapper.toggle();
    }
});

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
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                photoResult.textContent = xhr.responseText;
                getImage();
            } else {
                photoResult.textContent = "ERROR: " + xhr.responseText;
            }
        }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/photo");
    xhr.setRequestHeader("Authorization", auth);
    xhr.setRequestHeader("ImageFieldName", "image");

    xhr.send(data);
    $('#photo-selector').val('');
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
            $('#bio-input').val('');
        })
        .catch((err) => {
            bioRes.textContent = "ERROR: " + err;
        })
});

resumeForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    let file = document.querySelector("#resume-selector");
    let data = new FormData();
    data.append("resume", file.files[0]);

    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            console.log(this.responseText);
        }
    });

    let resumeResult = document.querySelector(".resume-result");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                resumeResult.textContent = xhr.responseText;
            } else {
                resumeResult.textContent = "ERROR: " + xhr.responseText;
            }
        }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/resume");
    xhr.setRequestHeader("Authorization", auth);
    xhr.setRequestHeader("ResumeFieldName", "resume");

    xhr.send(data);

    $('#resume-selector').val('');
});


function getImage() {
    let image = document.querySelector(".profile-picture");
    if (!image) {
        image = document.createElement("img");
        image.classList.add("profile-picture");
        imgLoc.appendChild(image);
    }
    makeRequest("users/me/photo", {}, "GET", true)
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

function getResume() {
    let resume = document.querySelector(".resume");
    makeRequest("users/me/resume", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.blob();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(showFile)
        .catch((err) => {
            let m = document.createElement("p");
            m.textContent = "resume unavailable: " + err;
            content.appendChild(m);
        });
}


function showFile(blob) {
    var data2 = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = data2;
    link.download = user.firstName + "_" + user.lastName + "_resume.pdf";
    link.click();
} 
