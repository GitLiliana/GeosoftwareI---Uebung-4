// Initialize the map an set coordinates and zoom
var map = L.map('mapid').setView([52.00, 10.00], 6);

// Add tile layer with map from OpenStreetMap
L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Add given Route
L.geoJSON(RouteGeoJSON).addTo(map);

// Initialize and add feature group for drawn items
var drawnItems = L.featureGroup().addTo(map);

// Initialize and add the Leaflet Draw tool
var drawControl = new L.Control.Draw({
    draw: {
        marker: false,       // disable all Draw tools except for rectangle
        circlemarker: false,
        circle: false,
        polyline: false,
        polygon: false
    },
    edit: {
        featureGroup: drawnItems
    }
}).addTo(map);


// Implement markers + pop-ups at intersactions between drawn ractangle and given route:
map.on('draw:created', function(e) {
    // Each time a feature is created, it's added to the over arching feature group
    drawnItems.addLayer(e.layer);
    // Converting drawn items to GeoJSON
    var rectangle = drawnItems.toGeoJSON();
    console.log(JSON.stringify(rectangle));
    // Calculate intersections
    var intersections = turf.lineIntersect(rectangle, RouteGeoJSON);
    console.log(JSON.stringify(intersections));
    var flippedIntersections = turf.flip(intersections);
    // Set markers with pop-ups
    for (i=0; i<flippedIntersections.features.length; i++) {
        var coordinatesMarker = flippedIntersections.features[i].geometry.coordinates;
        var marker = new L.marker(coordinatesMarker);
        marker.addTo(drawnItems);
        marker.bindPopup('Weather at this location:<br> <div id="weather"></div> <br> <div id="temperature"></div>', getWeather(coordinatesMarker));
        marker.openPopup();
    }
});

/**
 * Function to get the weather data from the API openweathermap.org.
 * @param {Array} Coordinates - Coordinates of requested location
 */
function getWeather (Coordinates) {
    $(document).ready(function(){
        var latitude = Coordinates[0];
        console.log(latitude);  //testing
        var longitude = Coordinates[1];
        var resource = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latitude + "&lon=" + longitude + "&exclude=minutely,hourly,daily&appid=" + personalAPIkey;
        console.log(resource);  //testing
        $.get(resource,
         function(data, status){
             displayWeather(data);
             console.log(status);
        });
    });
}

/**
   * Function to display weather at the current location in a comprehensible way.
   * @param {JSON} weatherData - weatherdata in JSON format
   */
 function displayWeather(weatherData) {
    //prints weather
    $("#weather").html = "Weather: " + weatherData.current.weather[0].main;  //does not find the id within the pop-up? Any suggested solutions??

    //prints current temperature
    let temp = weatherData.current.temp;
    let tempC = Math.round(temp - 273.15);
    $("#temperature").html = "Current temperature: " + tempC + "°C"; //see above

    console.log(tempC);  // testing
    console.log(weatherData); // testing
}
