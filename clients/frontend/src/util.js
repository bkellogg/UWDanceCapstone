export const headerAuthorization = "Authorization";

export const HOST = "dasc.capstone.ischool.uw.edu";
export const API_URL_BASE = "https://"+ HOST +"/api/v1/";


export function saveAuth(auth) {
    localStorage.setItem("auth", auth);
};

export function setLocalUser(user) {
    localStorage.setItem("user", user);
};

export function getLocalUser() {
    return JSON.parse(localStorage.getItem("user"));
};

export function getID(){
    return JSON.parse(localStorage.getItem("user")).id;
}

export function getAuth() {
    return localStorage.getItem("auth");
};

export function clearAuthAndUser() {
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
    localStorage.removeItem("allUsers");
    localStorage.removeItem("firstLoad");
    localStorage.removeItem("cast");
    localStorage.removeItem("socketCast");
    localStorage.removeItem("contested");
    localStorage.removeItem("uncasted")
};

export function makeRequest(resource, payload = "", method = "GET", useAuth = false) {
    let reqURL = API_URL_BASE + resource;
    payload = JSON.stringify(payload)
    let headers = new Headers();
    if (useAuth) {
        headers.append(headerAuthorization, getAuth())
    }
    headers.append("Content-Type", "application/json");
    headers.append("Content-Length", payload.length.toString())
    let req = {
        method: method,
        headers: headers
    }
    if (method !== "GET") {
        req.body = payload;
    }
    return fetch(reqURL, req);
}

export function refreshLocalUser() {
    return makeRequest("users/me", {}, "GET", true)
    .then((res) => {
        if (res.ok) {
            return res.json();
        }
        return res.text().then((t) => Promise.reject(t));
    })
    .then((data) => {
        setLocalUser(JSON.stringify(data));
    })
    .catch((err) => {
        signOut();
    })
}

export function signOut() {
    clearAuthAndUser();
    window.location.reload()
    window.location = "/"
}

export function uploadPhoto(val){
    let file = val;
    let data = new FormData();
    data.append("image", file.files[0]);
    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        
    });
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                return xhr.responseText
            } 
        }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/photo");
    xhr.setRequestHeader("Authorization", getAuth());
    xhr.setRequestHeader("ImageFieldName", "image");

    xhr.send(data);
}

export function uploadResume(val){
    let file = val;
    let data = new FormData();
    data.append("resume", file.files[0]);

    let xhr = new XMLHttpRequest();

    xhr.addEventListener("readystatechange", function () {
        if (this.readyState === 4) {
            
        }
    });

    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status < 400) {
                return xhr.responseText
            } 
        }
    };

    xhr.open("POST", "https://dasc.capstone.ischool.uw.edu/api/v1/users/me/resume");
    xhr.setRequestHeader("Authorization", getAuth());
    xhr.setRequestHeader("ResumeFieldName", "resume");

    xhr.send(data);
}

export function uploadBio(val){
    let payload = {
        "bio": val
    };
    makeRequest("users/me", payload, "PATCH", true)
        .then((res) => {
            if (res.ok) {
                refreshLocalUser()
                return
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(() => {
            refreshLocalUser()
        })
        .catch((err) => {
            console.error(err)
        })
}

export function uploadFName(val){
    let payload = {
        "firstName": val
    };
    makeRequest("users/me", payload, "PATCH", true)
        .then((res) => {
            if (res.ok) {
                refreshLocalUser()
                return
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(() => {
            refreshLocalUser()
        })
        .catch((err) => {
            console.error(err)
        })
}

export function uploadLName(val){
    let payload = {
        "lastName": val
    };
    makeRequest("users/me", payload, "PATCH", true)
        .then((res) => {
            if (res.ok) {
                refreshLocalUser()
                return
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then(() => {
            refreshLocalUser()
        })
        .catch((err) => {
            console.error(err)
        })
}

//TODO - needs to use the resume header? not sure how we're going to display this
export function getResume(){
    return makeRequest("users/me/resume", {}, "GET", true)
    .then((res) => {
        if (res.ok) {
            console.log(res)
            return res.json();
        }
    })
    .catch((err) => {
        console.error(err);
    })
}

//TODO - this is a TEST, change uid 1 to me to get the actual current users history
export function getDancerHistory(){
  return makeRequest("users/1/shows?history=all", {}, "GET", true)
  .then((res) => {
      if(res.ok){
          return res.json()
      }
  }).catch((err) => {
    console.error(err)
  })
}

export function handleError(err){
    if (err === "you must be signed in to use this resource"){
        signOut()
    }
}


