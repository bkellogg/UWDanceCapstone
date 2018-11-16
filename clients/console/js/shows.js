"use strict";

vex.defaultOptions.className = 'vex-theme-default'

var showTypes = [];
var shows = [];

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
            makeRequest("shows?history=current", {}, "GET", true)
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

            $(".active-shows").append('<div class="active-shows-card" style="width: 80%" id=' + showIDValue + '><h2 class="showName">'
                + showName + '</h2><p>Audition Information</p><p>Date: ' + auditionDay + '</p><p>Time: ' +
                auditionTime + '</p><p>Location: ' + location + '</p><button class="show pieces" id =wrapper-' + showIDValue +
                ' onClick=showPieces(this.id)>Pieces</button><button class="delete" id =' + showID + ' onClick="deleteShow(this.id)">Delete Show</button><div id=piece-wrapper-' + showIDValue +
                ' style= display:none> </div>  </div>')
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
                $("#" + pieceWrapperID).append('<button class="show dropDownClick" id=' + showPieceID + ' onClick=showPieces(this.id)>' + value.name + '</button><div class="info" id=' + pieceIDValue + ' style= display:none></div>')
                getAllUsersInPiece(value.id, pieceIDValue);
            });
        })
}


// Get Users in each piece (includes chor of piece and all dancers)
function getAllUsersInPiece(pieceID, pieceIDValue) {
    var totalDancers = 0;
    makeRequest("pieces/" + pieceID + "/users", {}, "GET", true)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            $(data.choreographer).each(function (index, value) {
                $("#" + pieceIDValue).append('<button class="show dropDownClick firstChild" id=' + pieceIDValue + '-dancer-table onClick=showTable(this.id)>Cast</button><div className=dancerInfo id=' +
                    pieceIDValue + '-dancer-table-info style= display:none><table class="all-dancers-table" id=' + pieceIDValue + '-table style= display:none ><tbody><tr class=categories><th>Name</th><th>Role</th><th>Bio</th><th>Email</th></tr></tbody></table><p  class="no-dancers" id=' + pieceIDValue + '-table-no>No Dancers Assigned</p></div>')
                $("#" + pieceIDValue).append('<button class="show dropDownClick" id=button-info-' + pieceIDValue + ' onClick=showPieceInfoSheet(this.id)>Information Sheet</button><div class=pieceInfo id=info-' + pieceIDValue + ' style= display:none><p id=no-' + pieceIDValue + '>No Piece Information Available </p></div>')
            });
            return data;
        })
        .then((data) => {
            $(data.dancers).each(function (index, value) {
                if (value.role.displayName === "Dancer") {
                    totalDancers += 1;
                }

                var table = document.getElementById(pieceIDValue + '-table');
                if (value != "") {
                    var tableMessage = document.getElementById(pieceIDValue + '-table-no');
                    tableMessage.style.display = "none";
                    table.style.display = "block";
                }
                var row = table.insertRow();
                var cell1 = row.insertCell(0);
                var cell2 = row.insertCell(1);
                var cell3 = row.insertCell(2)
                var cell4 = row.insertCell(3)
                cell1.innerHTML = value.firstName + " " + value.lastName;
                cell2.innerHTML = value.role.displayName;
                cell3.innerHTML = value.bio;
                cell4.innerHTML = value.email;
            });
            return data;
        })
        .then((data) => {
            var userData = data;
            makeRequest("pieces/" + pieceID + "/info", {}, "GET", true)
                .then((res) => {
                    if (res.ok) {
                        return res.json();
                    }
                    return res.text().then((t) => Promise.reject(t));
                })
                .then((data) => {
                    console.log(data)
                    var message = document.getElementById('no-' + pieceIDValue);
                    message.style.display = "none";
                    return data;
                })
                .then((data) => {
                    makeRequest("pieces/" + pieceID + "/musicians", {}, "GET", true)
                    .then((res) => {
                        if (res.ok) {
                            return res.json();
                        }
                        return res.text().then((t) => Promise.reject(t));
                    }).then((res) => {
                        data.musicians = res;
                        console.log(data)
                        return data;
                    })
                    .then((data) => {
                        $(data).each(function (index, value) {
                            $("#info-" + pieceIDValue).append('<p>Choreographer Name: ' + userData.choreographer.firstName + ' ' + userData.choreographer.lastName + '</p>' +
                                '<p>Choreographer Phone Number: ' + isEmpty(value.choreographerPhone) + '</p>' +
                                '<p>Choreographer Email: ' + isEmpty(userData.choreographer.email) + '</p>' +
                                '<p>Total Number of Dancers: ' + totalDancers + '</p>' +
                                '<p>Dancer Contact Information: </p><table class="all-dancers-table" id=' + pieceIDValue + '-dancer-table-2 style= display:none><tbody><tr class=categories><th>Name</th><th>Email</th></tr></tbody></table>' +
                                '<p>Dance Title: ' + isEmpty(value.title) + '</p>' +
                                '<p>Dance Runtime: ' + isEmpty(value.runTime) + '</p>' +
                                '<p>Composer(s): ' + isEmpty(value.composers) + '</p>' +
                                '<p>Music Title(s): ' + isEmpty(value.musicTitle) + '</p>' +
                                '<p>Performed By: ' + isEmpty(value.performedBy) + '</p>' +
                                '<p>Music Source: ' + isEmpty(value.MusicSource) + '</p>' +
                                '<p>Number of Live Musician: ' + value.musicians.length  + '</p>' +
                                '<p>Contact Information for Musicians: </p><table class="all-musicians-table" id=' + pieceIDValue + '-musician-table style= display:none><tbody><tr class=categories><th>Name</th><th>Email</th><th>Phone</th></tr></tbody></table>' +
                                '<p>Rehearsal Schedule: ' + isEmpty(value.rehearsalSchedule) + '</p>' +
                                '<p>Choreographers Notes: ' + isEmpty(value.chorNotes) + '</p>' +
                                '<p>Costume Descriptions: ' + isEmpty(value.costumeDesc) + '</p>' +
                                '<p>Props/Scenic Items Description: ' + isEmpty(value.itemDesc) + '</p>' +
                                '<p>Lighting Description: ' + isEmpty(value.lightingDesc) + '</p>' +
                                '<p>Other special needs: ' + isEmpty(value.otherNotes) + '</p>'
                            )
                    });
                    $(data.musicians).each(function (index, value) {
                        if (value != "") {
                            var message3 = document.getElementById(pieceIDValue + '-musician-table');
                            message3.style.display = "block";
                        }
                        var musicianTable = document.getElementById(pieceIDValue + '-musician-table');
                        var row = musicianTable.insertRow();
                        var cell1 = row.insertCell(0);
                        var cell2 = row.insertCell(1);
                        var cell3 = row.insertCell(2)
                        cell1.innerHTML = value.name;
                        cell2.innerHTML = value.email;
                        cell3.innerHTML = value.phone;
                    });
                    if (totalDancers > 0) {
                        var dancerTable = document.getElementById(pieceIDValue + '-dancer-table-2');
                        dancerTable.style.display = "block";
                        $(userData.dancers).each(function (index, value) {

                            if (value.role.displayName === "Dancer") {
                                var row = dancerTable.insertRow();
                                var cell1 = row.insertCell(0);
                                var cell2 = row.insertCell(1);
                                cell1.innerHTML = value.firstName + " " + value.lastName;
                                cell2.innerHTML = value.email;
                            }
                        });
                    }
                });
                    // $(data.musicians).each(function (index, value) {
                    //     if (value != "") {
                    //         var message3 = document.getElementById(pieceIDValue + '-musician-table');
                    //         message3.style.display = "block";
                    //     }
                    //     var musicianTable = document.getElementById(pieceIDValue + '-musician-table');
                    //     var row = musicianTable.insertRow();
                    //     var cell1 = row.insertCell(0);
                    //     var cell2 = row.insertCell(1);
                    //     var cell3 = row.insertCell(2)
                    //     cell1.innerHTML = value.name;
                    //     cell2.innerHTML = value.email;
                    //     cell3.innerHTML = value.phone;
                    // });
                    // if (totalDancers > 0) {
                    //     var dancerTable = document.getElementById(pieceIDValue + '-dancer-table-2');
                    //     dancerTable.style.display = "block";
                    //     $(userData.dancers).each(function (index, value) {

                    //         if (value.role.displayName === "Dancer") {
                    //             var row = dancerTable.insertRow();
                    //             var cell1 = row.insertCell(0);
                    //             var cell2 = row.insertCell(1);
                    //             cell1.innerHTML = value.firstName + " " + value.lastName;
                    //             cell2.innerHTML = value.email;
                    //         }
                    //     });
                    // }
                })
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

// Show/hide piece information 
function showPieces(event) {
    var x = document.getElementById('piece-' + event);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// Show/hide user table
function showTable(event) {
    var tableID = event + "-info"
    var x = document.getElementById(tableID);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// Show/hide piece information sheet
function showPieceInfoSheet(event) {
    var infoSheetID = event.slice(7);
    var x = document.getElementById(infoSheetID);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}

// Assign N/a to empty fields in piece information sheet
function isEmpty(input) {
    var none = "None";
    if (input === "") {
        return none;
    } else {
        return input;
    }
}

// Show/hide live musician information in piece information sheet
function showMusicians(event) {
    var musicianID = event.slice(7);
    var x = document.getElementById(musicianID);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
    }
}