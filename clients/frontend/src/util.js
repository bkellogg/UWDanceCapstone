export const headerAuthorization = "Authorization";

export const API_URL_BASE = "https://dasc.capstone.ischool.uw.edu/api/v1/";

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
        console.error(err);
        //alert(err);
        signOut();
    })
}

export function signOut() {
    //makeRequest("sessions", {}, "DELETE", true);
    // no need to handle the respose here. If it fails, you can treat the auth and
    // user as invalid and clear their local storage entries anyway.
    clearAuthAndUser();
}

export function uploadPhoto(){
    
}

export function uploadResume(val){
    let payload = {
        "resume": val
    };
    makeRequest(("users" + getID()), payload, "POST", true)
        .then((res) =>{
            if (res.ok) {
                refreshLocalUser()
                return
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .catch((err) => {})
}

export function uploadBio(val){
    let payload = {
        "bio": val
    };
    makeRequest("users/", payload, "PATCH", true)
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
        .catch((err) => {})
}

export function uploadFName(val){
    let payload = {
        "firstname": val
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
        .catch((err) => {})
}

export function uploadLName(val){
    let payload = {
        "lastname": val
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
        .catch((err) => {})
}

/*
export function getResume(){
  let id = this.state.user.id;
  let auth = this.state.auth;
  fetch(Util.API_URL_BASE + "users/" + id + "/resume?auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.blob();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            this.setState({
              resume : data
            })
        })
        .catch((err) => {
            this.setState({
              resumeErr: err
            })
        });
} */

/*
export function getPhoto(){
    fetch(Util.API_URL_BASE + "users/me/photo?auth=" + this.state.auth)
        .then((res) => {
            if (res.ok) {
                return res.blob();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            this.setState({
              photoSrc : URL.createObjectURL(data)
            })
        })
        .catch((err) => {
            this.setState({
              photoError: err
            })
        });
} */