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
        alert(err);
        signout();
    })
}

export function signout() {
    makeRequest("sessions", {}, "DELETE", true);
    // no need to handle the respose here. If it fails, you can treat the auth and
    // user as invalid and clear their local storage entries anyway.
    clearAuthAndUser();
    window.location.href = "index.html";
}