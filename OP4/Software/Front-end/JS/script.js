var ip = window.location.hostname;
var port = window.location.port;

$(document).ready(function() {
    // Toggle selected on buttons in button bar
    $('.buttonbarbutton').on('click', function(){
        $('.buttonbarbutton').removeClass('selected');
        $(this).addClass('selected');
    });

    setMapView();
    loadHeader('Visuals/breaking_waves.jpg');
});

function loadHeader(image) {
    $("#background").one("load", function() {
        console.log('done loading header image');
    }).attr("src", image);
}

// Sets the content to the specified view
function setContentTo(file, callback) {
    var url = 'Views/' + file;
    $.get(url, function(data) {
        $('#content').html(data);
        if(callback != undefined) {
            callback(); //This function is ran when the async .get is done
        }
    });
}

function setMapView() {
    setContentTo('map.html');
    initMap();
}

function setOverviewView() {
    setContentTo('overview.html');
    getList();
}

function setContactView() {
    setContentTo('contact.html');
}

// Initializes the map, sets pins to user location and received pins
function initMap() {
    $.getJSON('https://geoip-db.com/json/geoip.php?jsonp=?') 
    .done (function(location) {

        let url = 'https://' + ip + ':' + port + '/get/pins'; 
        $.get(url, function(data) {

            let coords = new google.maps.LatLng(location.latitude, location.longitude);
            let ocean = {lat: 51.9244, lng: 3.4777};

            let mapOptions = {
              zoom: 10,
              center: coords
            }
            let map = new google.maps.Map(document.getElementById("map"), mapOptions);

            // Adds the user location to the map
            let position = new google.maps.Marker({
                position: coords,
                title: "Your Location"
            });
            position.setMap(map);

            if(safeProcess(data)) {
                // Iterates over the list and adds its contents to the map as markers if they are valid
                for (i = 0; i < data.result.length; i++) {
                    
                    var pin = data.result.result[i]._fields[0].properties;
                    if (intactPin(pin)) {

                        // Create the Marker
                        let pincoords = new google.maps.LatLng(pin.lat, pin.long)
                        let color = pinColor(pin.responded);

                        let infowindow = new google.maps.InfoWindow({
                            content: pinInfo(pin.udid, pin.datetime, pin.responded)
                        });

                        let marker = new google.maps.Marker({
                            position: pincoords,
                            // label: {text: pin.udid.toString(), color: "white"},
                            map: map,
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                strokeColor: color,
                                scale: 7
                            }
                        });

                        marker.addListener('click', function() {
                            infowindow.open(map, marker);
                        });
                    }
                }
            }
        });
    });
}

// Create a list of pins
function getList() {
    let url = 'https://' + ip + ':' + port + '/get/pins'; 
    $.get(url, function(data) {
        if(safeProcess(data)) {

            // Iterates over the list and adds its contents to the map as markers if they are valid
            for (i = 0; i < data.result.length; i++) {
                
                var pin = data.result.result[i]._fields[0].properties;
                if (intactPin(pin)) {

                    // Create the Marker
                    let color = pinColor(pin.responded);

                    let infowindow = new google.maps.InfoWindow({
                        content: pinInfo(pin.udid, pin.datetime, pin.responded)
                    });

                    var element = '<li style="background-color: ' + pinColor(pin.responded) + '">' + pin.udid + '<br>' + pin.datetime + '</li>'

                    $('#list').append(list);
                }
            }
        }
    });    
}

// Checks if the data is okay
function safeProcess(data) {
    if(data) {
        if (data.ok == 'no') {
            alert(parseError(data.error, data.query));
            return false;
        } else if (data.ok == 'yes') {
            return true;
        }
    }
}

// Checks if a pin contains the essential data
function intactPin(data) {
    if (data.lat &&
        data.long &&
        data.udid) {
            return true;
    } else {
            return false;
    }
}

// Returns the appropriate color for a pin
function pinColor(responded) {
    if(responded) {
        return "green";
    } else {
        return "red";
    }
}

function respondedToggle() {
    var toggle = document.getElementById("responded");
    console.log(toggle.checked);
}

// Creates a string for the pin info window
function pinInfo(udid, datetime, checked) {
    return  '<p>UDID: <b>' + udid + '</b></p>' +
            '<p>Time: <b>' + parseTime(datetime) + '</b></p>' +
            '<p>Date: <b>' + parseDate(datetime) + '</b></p>' +
            '<div id=\'toggle\'>' +
                '<label>Responded:</label>' +
                '<label class="switch">' +
                    pinInfoCheckbox(checked) +
                    '<div class="slider round"></div>' +
                '</label>' +
            '</div>'
}

function pinInfoCheckbox(checked) {
    if (checked) {
        return '<input id=\'responded\' onclick=\'respondedToggle()\' type="checkbox" checked >'
    } else {
        return '<input id=\'responded\' onclick=\'respondedToggle()\' type="checkbox">'
    }
}

// Parses the date
function parseDate(dt) {
    let datetime = dt.toString();
    let year        = datetime.substring(0,4);
    let month       = datetime.substring(4,6);
    let day         = datetime.substring(6,8);
    return day + '-' + month + '-' + year;
}

// Parses the time
function parseTime(dt) {
    let datetime = dt.toString();
    let hours        = datetime.substring(8,10);
    let minutes       = datetime.substring(10,12);
    return hours + ':' + minutes;
}

// Parses an error in data
function parseError(error, query) {
    let result = 
        'Error: ' + error + '\n' +
        'Query: ' + query
    return result
}
