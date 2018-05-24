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
getResume();


photoForm.addEventListener("submit", (evt) => {
    evt.preventDefault();
    uploadPhoto();
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
    uploadResume();
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
            if(res.status != 200) {
                $("#resume").hide();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var link = URL.createObjectURL(data);
            $("#resume").attr("href", link);
        })
        .catch((err) => {
            let m = document.createElement("p");
            m.textContent = "resume unavailable: " + err;
            content.appendChild(m);
        });
}