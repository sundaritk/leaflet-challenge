//URL for the GeoJSON Data of the Site of the USGS
let geoJSONUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"
 
//Create a LayerGroup for Earthquakes
let earthquakes = new L.LayerGroup();

//Create Variables to Reference Two Tile Layers
let OpenMapSurfer_Roads = L.tileLayer('https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png', {
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 16,
    minZoom: 2
});

let CartoDB_DarkMatter = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 16,
    minzoom: 2
});

let baseMaps = {
    "Open Map": OpenMapSurfer_Roads,
    "Dark Map": CartoDB_DarkMatter
};

//Create a Map to Display the Layers for the Open Map and Earthquakes
let myMap = L.map("map", {
    center: [39.8283, -98.5795], 
    zoom: 4,
    layers: [OpenMapSurfer_Roads, earthquakes]
});

//Add the Layers of baseMaps to the Map with Control 
L.control.layers(baseMaps).addTo(myMap);

//Use D3.js to Make the GeoJSON Call to the Site of the USGS
d3.json(geoJSONUrl, function(geoJSONData) {
    //Create a Function to Determine Size of a Marker as a Function of the Magnitude of an Earthquake
    function magnitudeSize(magnitude) {
        switch (true) {
            case magnitude > 5:
                return 20;
            case magnitude > 4:
                return 16;
            case magnitude > 3:
                return 12;
            case magnitude > 2:
                return 8;
            case magnitude > 1:
                return 4;
            default:
                return 2;
        }        
    }
    //Create a Function to Determine the Color of a Marker as a Function of the Magnitude of an Earthquake
    function magnitudeColor(magnitude) {
        switch (true) {
        case magnitude > 5:
            return "brown";
        case magnitude > 4:
            return "red";
        case magnitude > 3:
            return "orange";
        case magnitude > 2:
            return "yellow";
        case magnitude > 1:
            return "green";
        default:
            return "lightgreen";
        }
    }
    //Create a Function to Determine the Style of a Marker as a Function of the Magnitude of an Earthquake
    function markerStyle(feature) {
        return {
          opacity: 1,
          fillOpacity: 1,
          fillColor: magnitudeColor(feature.properties.mag),
          color: "#000000",
          radius: magnitudeSize(feature.properties.mag),
          stroke: true,
          weight: 0.75
        };
    }

    //Create a Layer for the GeoJSON Data to Contain the Array of Features
    L.geoJSON(geoJSONData, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: markerStyle,
        //Bind a Popup for the Location, Date/Time, and Magnitude of an Earthquake
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h4>Location: " + feature.properties.place + 
            "</h4><hr><p>Date/Time: " + new Date(feature.properties.time) + 
            "</p><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    //Add the GeoJSON Data to the LayerGroup for Earthquakes 
    }).addTo(earthquakes);
    //Add the LayerGroup for Earthquakes to the Map
    earthquakes.addTo(myMap);

    //Create the Legend for the Map
    let legend = L.control({ position: "bottomleft" });
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend"), 
        magnitudeLevels = [0, 1, 2, 3, 4, 5];

        div.innerHTML += "<h3>Magnitude</h3>"

        for (let i = 0; i < magnitudeLevels.length; i++) {
            div.innerHTML +=
                '<i style="background: ' + magnitudeColor(magnitudeLevels[i] + 1) + '"></i> ' +
                magnitudeLevels[i] + (magnitudeLevels[i + 1] ? '&ndash;' + magnitudeLevels[i + 1] + '<br>' : '+');
        }
        return div;
    };
    //Add the Legend to the Map
    legend.addTo(myMap);
});