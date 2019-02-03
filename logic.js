// Store Earthquake endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Store tectonic url
var tectonicPlatesURL = "https://github.com/fraxen/tectonicplates/raw/master/GeoJSON/PB2002_boundaries.json";

// Choose color function
function chooseColor(mag) {
  if(mag < 1)
    {return "springgreen";}
  else if (mag < 2)
    return "greenyellow";
  else if (mag < 3)
    return "gold";
  else if (mag < 4)
    return "orange";
  else if (mag < 5)
    return "darkorange";
  else if (mag >= 5)
    return "orangered";
}

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features); 
});

// Define a function we want to run once for each feature in the features array
function createFeatures(earthquakeData) {
  // Give each feature a popup describing the place and time of the earthquake
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: function(feature, layer) {
        layer.bindPopup("<h3>Magnitude:" + feature.properties.mag + "</h3><h3>Location: "+ feature.properties.place +
        "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");     
    },
    pointToLayer: function (feature, latlng) {
      return new L.circle(latlng,
        {radius: feature.properties.mag * 20000,
        fillColor: chooseColor(feature.properties.mag),
        fillOpacity: .8,
        color: "black",
        stroke: true,
        weight: .8
    })
    }    
  });
  
  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes);

  // Testing with console.log inside createFeatures function
  console.log(`List of earthquakes inside createFeatures: ${earthquakes}`);
}

function createMap(earthquakes) {
  // Define streetmap and darkmap
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create tectonic layer
  var tectonicPlates = new L.LayerGroup();

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates 
  };

   // Add tectonic plates data
   d3.json(tectonicPlatesURL, function(tectonicData) {
    L.geoJson(tectonicData, {
        color: "orange",
        weight: 2
    })
    .addTo(tectonicPlates);
    console.log(`Tectonic plates: ${tectonicPlates}`);
  });

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes,tectonicPlates]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Create legend
  var legend = L.control({position: "bottomright"});

  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0, 1, 2, 3, 4, 5];

  // Create legend
  for (var i = 0; i < limits.length; i++) {
      div.innerHTML += '<li style="background:' + chooseColor(limits[i] ) + '"></li> ' +
        limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + '<br>' : '+');
  }
  return div;
  };
  legend.addTo(myMap);
  // Testing with console.log inside createMap function
  console.log(`List of earthquakes inside createMap: ${earthquakes}`);
}
