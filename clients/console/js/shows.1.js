"use strict";

vex.defaultOptions.className = 'vex-theme-default'

var showTypes = [];
var shows = [];
var pieces = [];


getActiveShows();


// Get Active Shows
function getActiveShows() {
    makeRequest("shows/types?includeDeleted=false", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                showTypes[value.id] = value.desc;
            });
        })
        .then(() => {
            makeRequest("shows", {}, "GET", true)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return res.text().then((t) => Promise.reject(t));
                })
                .then((data) => {
                    var showInfo = data.shows
                    $(showInfo).each(function (index, value) {
                        var show = {};
                        show["showID"] = value.id
                        show["showType"] = value.typeID;
                        show["auditionID"] = value.auditionID;
                        shows.push(show);
                    });
                })
                .then(() => {
                    $(shows).each(function (index, value) {
                        value["showName"] = showTypes[value.showType];
                    });
                })
                .then(() => {
                    $(shows).each(function (index, value) {
                        getAuditionInfo(value.auditionID, index);
                    })
                })
        })
}


// Get Audition info
function getAuditionInfo(auditionID, index) {
    makeRequest("auditions/" + auditionID, {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            shows[index]["auditionTime"] = data.time;
            shows[index]["location"] = data.location;
        })
        .then(() => {
            var auditionDay = moment(shows[index].auditionTime).format('MMM. Do, YYYY');
            var auditionTime = moment(shows[index].auditionTime).utcOffset('-0700').format("hh:mm a");
            var showName = shows[index].showName;
            var location = shows[index].location;
            var showID = shows[index].showID
            var showIDValue = "show-" + index;

            $(".active-shows").append('<div class="active-shows-card" id=' + showIDValue + '><h2 class="showName">'
                + showName + '</h2><p>Audition Information</p><p>Date: ' + auditionDay + '</p><p>Time: ' +
                auditionTime + '</p><p>Location: ' + location + '</p><button class="show" id =wrapper-' + showIDValue + ' onClick=showPieces(this.id)>Pieces</button><div id=piece-wrapper-' + showIDValue + ' style= display:none></div><button class="delete" id =' +
                showID + ' onClick="deleteShow(this.id)">Delete Show</button></div>')
        })
        .then(() => {
            var pieceWrapperID = "piece-wrapper-" + "show-" + index;
            getAllPiecesInShow(shows[index].showID, pieceWrapperID);
        })
}


// Get all pieces for each show
function getAllPiecesInShow(showID, pieceWrapperID) {
    makeRequest("shows/" + showID + "/pieces", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data.pieces).each(function (index, value) {
                var pieceIDValue = pieceWrapperID + "-" + index
                var showPieceID = pieceIDValue.slice(6);
                $("#" + pieceWrapperID).append('<button class="show" id=' + showPieceID + ' onClick=showPieces(this.id)>' + value.name + '</button><div class="piece-info" id=' + pieceIDValue + ' style= display:none></div>')
                getAllUsersInPiece(value.id, pieceIDValue);
                //getPieceInfoSheet(value.id, pieceIDValue);
            });
        })
}


// Get Users in each piece (includes chor of piece and all dancers)
function getAllUsersInPiece(pieceID, pieceIDValue) {
    makeRequest("pieces/" + pieceID + "/users", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data.choreographer).each(function (index, value) {
                $("#" + pieceIDValue).append('<p id=chor-' + pieceID + '>Choreographer: ' + value.firstName + ' ' + value.lastName + '</p>')
                $("#chor-" + pieceID).append('<p id=chor-' + pieceID + '-email>Email: ' + value.email + '</p>')
                $("#" + pieceIDValue).append('<button class="show" id=' + pieceIDValue + '-dancer-table onClick=showTable(this.id)>Dancer Contact Information:</button><div className=dancerInfo id=' +
                    pieceIDValue + '-dancer-table-info style= display:none><table id=' + pieceIDValue + '-table ><tbody><tr className=categories><th>Name</th><th>Email</th><th>Bio</th></tr></tbody></table></div>')
                $("#" + pieceIDValue).append('<button class="show" id=button-piece-info-' + pieceIDValue + ' onClick=showPieceInfoSheet(this.id)>Piece Information Sheet:</button><div className=pieceInfo id=piece-info-' + pieceIDValue + ' style= display:none><p id=no-piece-' + pieceIDValue + '>No Piece Information Available </p></div>')
            });
            return data;
        })
        .then((data) => {
            $(data.dancers).each(function (index, value) {
                var table = document.getElementById(pieceIDValue + '-table');
                var row = table.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2)
                cell1.innerHTML = value.firstName + " " + value.lastName;
                cell2.innerHTML = value.email;
                cell3.innerHTML = value.bio;
            });
        })
        .then(() => {
            makeRequest("pieces/" + pieceID + "/info", {}, "GET", true)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return res.text().then((t) => Promise.reject(t));
                })
                .then((data) => {
                    var message = document.getElementById('no-piece-' + pieceIDValue);
                    message.style.display = "none";
                    $(data).each(function (index, value) {
                        $("#piece-info-" + pieceIDValue).append('<p>Dance Title: ' + value.title + '</p>' +
                            '<p>Dance Runtime: ' + value.runTime + '</p>' +
                            '<p>Composer(s): ' + value.composers + '</p>' +
                            '<p>Music Title(s): ' + value.musicTitle + '</p>' +
                            '<p>Performed By: ' + value.performedBy + '</p>' +
                            '<p>Music Source: ' + value.MusicSource + '</p>' +
                            '<p>Rehearsal Schedule: ' + value.rehearsalSchedule + '</p>' +
                            '<p>Choreographers Notes: ' + value.chorNotes + '</p>' +
                            '<p>Costume Descriptions: ' + value.costumeDesc + '</p>' +
                            '<p>Item Description: ' + value.itemDesc + '</p>' +
                            '<p>Lighting Description: ' + value.lightingDesc + '</p>' +
                            '<p>Other Notes: ' + value.otherNotes + '</p>')
                    });
                })
        })
}

// Get Piece Info Sheet
function getPieceInfoSheet(pieceID, pieceIDValue) {
    makeRequest("pieces/" + pieceID + "/info", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data).each(function (index, value) {
                $("#piece-info-" + pieceIDValue).append('<p>Dance Title: ' + value.title + '</p>' +
                    '<p>Dance Runtime: ' + value.runTime + '</p>' +
                    '<p>Composer(s): ' + value.composers + '</p>' +
                    '<p>Music Title(s): ' + value.musicTitle + '</p>' +
                    '<p>Performed By: ' + value.performedBy + '</p>' +
                    '<p>Music Source: ' + value.MusicSource + '</p>' +
                    '<p>Rehearsal Schedule: ' + value.rehearsalSchedule + '</p>' +
                    '<p>Choreographers Notes: ' + value.chorNotes + '</p>' +
                    '<p>Costume Descriptions: ' + value.costumeDesc + '</p>' +
                    '<p>Item Description: ' + value.itemDesc + '</p>' +
                    '<p>Lighting Description: ' + value.lightingDesc + '</p>' +
                    '<p>Other Notes: ' + value.otherNotes + '</p>')
            });
        })
}

// Delete show by show ID
function deleteShow(event) {
    vex.dialog.confirm({
        message: 'Are you sure you want to delete this show?',
        callback: function (response) {
            if (response) {
                makeRequest("shows/" + event, {}, "DELETE", true)
                    .then(() => {
                        location.reload();
                    })
            } else {
                return
            }
        }
    });
}

function showPieces(event) {
    var x = document.getElementById('piece-' + event);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function showTable(event) {
    var tableID = event + "-info"
    var x = document.getElementById(tableID);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

function showPieceInfoSheet(event) {
    var infoSheetID = event.slice(7);
    var x = document.getElementById(infoSheetID);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// Get All Active Shows

// Get all show types

// Get audition information for each show

// Get all pieces in each show

/*
        .then(() => {
    console.log(shows)
    var auditionDay = moment(shows[index].auditionTime).format('MMM. Do, YYYY');
    var auditionTime = moment(shows[index].auditionTime).utcOffset('-0700').format("hh:mm a");
    var showName = shows[index].showName;
    var location = shows[index].location;
    var showID = shows[index].showID

    $(".active-shows").append('<div class="active-shows-card" id=' + index + '><h2 class="showName">'
        + showName + '</h2><p>Audition Information</p><p>Date: ' + auditionDay + '</p><p>Time: ' +
        auditionTime + '</p><p>Location: ' + location + '</p><button class="delete" id =' +
        showID + ' onClick="deleteShow(this.id)">Delete Show</button></div>')
})



*/

