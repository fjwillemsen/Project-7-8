var ip = window.location.hostname;
var port = window.location.port;

function initMap() {
    $.getJSON('https://geoip-db.com/json/geoip.php?jsonp=?') 
    .done (function(location) {

        let url = 'http://' + ip + ':' + port + '/pins';
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

            console.log(data);

            // Iterates over the list and adds its contents to the map as markers if they are valid
            var i = data.length - 1;
            for (i; i >= 0; i--) {
                let pin = data[i];
                if (pin) {
                    console.log(pin);
                    if (intactPin(pin)) {

                        // Create the Marker
                        let pincoords = new google.maps.LatLng(pin.lat, pin.long)
                        let color = pinColor(pin.responded);

                        let infowindow = new google.maps.InfoWindow({
                          content: pinInfo(pin.udid, pin.datetime)
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

function intactPin(data) {
    if (data.lat &&
        data.long &&
        data.udid) {
            return true;
    } else {
            return false;
    }
}

function pinColor(responded) {
    if(responded) {
        return "green";
    } else {
        return "red";
    }
}

function pinInfo(udid, datetime) {
    return  '<p>UDID: <b>' + udid + '</b></p>' +
            '<p>Time: <b>' + parseTime(datetime) + '</b></p>' +
            '<p>Date: <b>' + parseDate(datetime) + '</b></p>'
}

function parseDate(dt) {
    let datetime = dt.toString();
    let year        = datetime.substring(0,4);
    let month       = datetime.substring(4,6);
    let day         = datetime.substring(6,8);
    return day + '-' + month + '-' + year;
}

function parseTime(dt) {
    let datetime = dt.toString();
    let hours        = datetime.substring(8,10);
    let minutes       = datetime.substring(10,12);
    return hours + ':' + minutes;
}
