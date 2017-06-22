function initMap() {
    $.getJSON('https://geoip-db.com/json/geoip.php?jsonp=?') 
    .done (function(location) {
        var coords = new google.maps.LatLng(location.latitude, location.longitude);
        var ocean = {lat: 51.9244, lng: 3.4777};

        var mapOptions = {
          zoom: 10,
          center: coords
        }

        var map = new google.maps.Map(document.getElementById("map"), mapOptions);

        var position = new google.maps.Marker({
            position: coords,
            title:"Hello World!"
        });

        var marker = new google.maps.Marker({
            position: ocean,
            title:"Hello World!"
        });

        // To add the marker to the map, call setMap();
        position.setMap(map);
        marker.setMap(map);
    });
}
