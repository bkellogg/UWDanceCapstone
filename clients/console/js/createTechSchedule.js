"use strict";
refreshLocalUser();
let auth = getAuth();

var timeOptions = ["0700", "0730", "0800", "0830", "0900", "0930", "1000", "1030", "1100", "1130", "1200", "1230", "1300", "1330", "1400", "1430",
    "1500", "1530", "1600", "1630", "1700", "1730", "1800", "1830", "1900", "1930", "2000", "2030", "2100", "2130"]
var showingCount = 0;
var spacingCount = 0;
var loadInCount = 0;
var notesCount = 0;
var techRehersalCount = 0;
var dressRehersalCount = 0;
var previewCount = 0;
var performanceCount = 0;
var miscCount = 0;



populateConcertNames()
createTimes()

// Pick date
$(document).ready(function () {
    $("#showing-date-input").datepicker({
        altField: "#showing-day-input",
        altFormat: "DD"
    });
    $("#spacing-date-input").datepicker({
        altField: "#spacing-day-input",
        altFormat: "DD"
    });
});

// Get Current Year
$(document).ready(function () {
    var date = new Date();
    var year = date.getFullYear();
    document.getElementById("today").value = year;
});

// Create Times
function createTimes() {
    var startTime = '<option value=""><strong>Start Time</strong></option>';
    var endTime = '<option value=""><strong>End Time</strong></option>' +
        '<option value=""><strong></strong></option>' +
        '<option value="Call"><strong>Call</strong></option>' +
        '<option value="Curtain"><strong>Curtain</strong></option>';
    $(timeOptions).each(function (index, value) {
        startTime += '<option value="' + value + '">' + value + '</option>';
        endTime += '<option value="' + value + '">' + value + '</option>';
    });
    $('.startTime-input').html(startTime);
    $('.endTime-input').html(endTime);
}



// fetch to show types
function populateConcertNames() {
    fetch(API_URL_BASE + "shows/types?includeDeleted=false&auth=" + auth)
        .then((res) => {
            if (res.ok) {
                return res.json();
            }
            return res.text().then((t) => Promise.reject(t));
        })
        .then((data) => {
            var options = '<option value=""><strong>Concert Name</strong></option>';
            $(data).each(function (index, value) {
                options += '<option value="' + value.desc + '">' + value.desc + '</option>';
            });
            $('#concert-name-input').html(options);
        })
}

// Add slots for spacing
$(document).ready(function () {
    var wrapper = $(".spacing-slot");
    var add_button = $(".spacing-add-form-field");

    var x = 0;
    $(add_button).click(function (e) {
        e.preventDefault();
        x++;
        $(wrapper).append('<div id="spacing-slot"><select class="startTime-input"><option id="spacing-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="spacing-slot-endTime-input" value=""></option></select><input type="text" id="spacing-slot-desc-input" placeholder="Description" /><input type="text" id="spacing-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
        $('#spacing-slot').attr("id","spacing-slot" + x);
        createTimes()
    });

    $(wrapper).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
});

// Add slots for tech rehersal 
$(document).ready(function () {
    var wrapper = $(".tech-rehersal-slot");
    var add_button = $(".tech-rehersal-add-form-field");

    var x = 0;
    $(add_button).click(function (e) {
        e.preventDefault();
        x++;
        $(wrapper).append('<div id="tech-rehersal-slot"><select class="startTime-input"><option id="tech-rehersal-slot-startTime-input value=""></option></select><select class="endTime-input"><option id="tech-rehersal-slot-endTime-input" value=""></option></select><input type="text" id="tech-rehersal-slot-desc-input" placeholder="Description" /><input type="text" id="tech-rehersal-slot-crew-input" placeholder="Crew" /><a href="#" class="delete">Delete</a></div>');
        $('#tech-rehersal-slot').attr("id","tech-rehersal-slot" + x);
        createTimes()
    });

    $(wrapper).on("click", ".delete", function (e) {
        e.preventDefault(); $(this).parent('div').remove(); x--;
    })
});
