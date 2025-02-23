// let userLocation = { lat: 40.1215, lng: -100.4504 };

// let map;
// let userMarker;

// function initMap() {
//   console.log("Google Maps API Loaded");

//   const map = new google.maps.Map(document.getElementById("map"), {
//     zoom: 13,
//     center: { lat: 40.7128, lng: -74.006 },
//     // center: userLocation,
//   });

//   new google.maps.Marker({
//     position: userLocation,
//     map: map,
//     title: "Parking Spot",
//   });
// }

// function getUserLocation() {
//   console.log("Herrerer");
//   if (navigator.geolocation) {
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         userLocation = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };
//         console.log("User location:", userLocation);
//       },
//       (error) => {
//         console.error("Error getting location:", error.message);
//       }
//     );
//   } else {
//     console.error("Geolocation is not supported by this browser.");
//   }
// }

// Call the function to get the location

let userLocation = null; // Variable to store user's location
let map;
let marker;

function initMap() {
  window.map = new google.maps.Map(document.getElementById("map"), {
    zoom: 15,
    center: { lat: 0, lng: 0 }, // Temporary center before getting location
  });

  // Get user's location
  getUserLocation();
}

function getUserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        // Update the map center and place a marker
        window.map.setCenter(userLocation);

        if (marker) {
          marker.setMap(null); // Remove old marker
        }

        marker = new google.maps.Marker({
          position: userLocation,
          map: map,
          title: "You are here!",
        });

        console.log("User Location:", userLocation);
      },
      (error) => {
        console.error("Error getting location:", error.message);
        alert("Unable to access location. Please enable GPS.");
      }
    );
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

// Ensure function is globally accessible
window.initMap = initMap;
