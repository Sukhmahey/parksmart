import { getParkingSpaces } from "../../crud.js";
const { Map, InfoWindow } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
  "marker"
);

const bounds = new google.maps.LatLngBounds();

const mapElement = document.getElementById("map");

const initMap = () => {
  // const markerElement = document.getElementById("marker");
  const marker = document.createElement("gmp-advanced-marker");

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log("position", lat, lng);

          mapElement.center = { lat, lng };
          marker.position = { lat, lng };
          marker.title = "Your current location";

          bounds.extend(new google.maps.LatLng(lat, lng));
          // Append marker to the map
          mapElement.appendChild(marker);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Geolocation permission denied or unavailable.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Check if the user has granted location permission already
  if (navigator.permissions) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          requestLocation();
        } else {
          // Permission denied, alert user
          alert(
            "Geolocation permission is denied. Please enable location services."
          );
        }
      })
      .catch((error) => {
        console.error("Error checking permissions:", error);
        alert("Unable to check permissions.");
      });
  } else {
    // Fallback for older browsers that don't support the Permissions API
    alert(
      "Your browser does not support the Permissions API. We will prompt for location access."
    );
    requestLocation();
  }
};

const fetchParkingSpots = async () => {
  const parkingSpaceArray = await getParkingSpaces();
  const parkingListContainer = document.querySelector(".parking-list");

  console.log("parkingSpaceArray---", parkingSpaceArray);

  parkingSpaceArray.forEach((parkingSpot) => {
    bounds.extend(
      new google.maps.LatLng(parkingSpot?.latitude, parkingSpot?.longitude)
    );

    // Adding markers
    const marker = document.createElement("gmp-advanced-marker");
    marker.position = {
      lat: parkingSpot?.latitude,
      lng: parkingSpot?.longitude,
    };
    marker.title = parkingSpot?.title;

    // Append marker to the map
    mapElement.appendChild(marker);

    createOverlayFunction(marker, parkingSpot.imageUrl, parkingSpot.address);

    // Populating list of available spaces
    const parkingSpotElement = document.createElement("div");
    parkingSpotElement.classList.add("parking-spot");

    // Create element for Image
    const spotImage = document.createElement("div");
    spotImage.classList.add("spot-image");
    spotImage.style.backgroundImage = parkingSpot?.imageUrl
      ? `url(${parkingSpot?.imageUrl})`
      : "";

    // Container for Info
    const spotInfo = document.createElement("div");
    spotInfo.classList.add("spot-info");

    // Spot name
    const spotName = document.createElement("h4");
    spotName.textContent = parkingSpot.title;

    // Spot Location
    const spotLocation = document.createElement("p");
    spotLocation.textContent = parkingSpot.address;

    // Price Per Hour
    const pricePerHour = document.createElement("p");
    pricePerHour.textContent = `Price per hour: $${parkingSpot.price_per_hour}`;

    // Append elements to the spot-info div
    spotInfo.appendChild(spotName);
    spotInfo.appendChild(spotLocation);
    spotInfo.appendChild(pricePerHour);

    // Append the spot-image and spot-info to the parking-spot div
    parkingSpotElement.appendChild(spotImage);
    parkingSpotElement.appendChild(spotInfo);

    parkingSpotElement.addEventListener("click", () => {
      resetAllMarkers();
      // Set the new map center and zoom
      mapElement.setAttribute(
        "center",
        `${marker.position.lat},${marker.position.lng}`
      );
      mapElement.setAttribute("zoom", "16"); // Adjust zoom level

      // Create new pin for active marker, if required
      const pin = new PinElement({
        scale: 1.5,
        background: "#FBBC04",
      });

      console.log("Markers", marker, pin.element);
      // marker.removeChild(pin.element);
      // Add pin to the marker element
      // marker.appendChild(pin.element);

      let hasSameChild = false;

      for (const child of marker.childNodes) {
        // You can use a condition to compare the child (for example, check the type or other properties)
        console.log(
          "Check",
          child,
          pin.element,
          JSON.stringify(child) === JSON.stringify(pin.element)
        );
        if (JSON.stringify(child) === JSON.stringify(pin.element)) {
          hasSameChild = true;
          break;
        }
      }

      if (!hasSameChild) {
        marker.appendChild(pin.element);
        console.log("New pin added to marker.");
      }

      // Show overlay modal at the new position
      // createOverlayFunction(
      //   marker,
      //   parkingSpot.imageUrl,
      //   parkingSpot.address,
      //   true
      // );
    });

    // Append the parking spot element to the parking-list container
    parkingListContainer.appendChild(parkingSpotElement);
  });

  setTimeout(() => {
    mapElement.setAttribute(
      "center",
      `${bounds.getCenter().lat()},${bounds.getCenter().lng()}`
    );
    mapElement.setAttribute("zoom", getOptimalZoom(bounds));
  }, 1000);
};
const getOptimalZoom = (bounds) => {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latDiff = Math.abs(ne.lat() - sw.lat());
  const lngDiff = Math.abs(ne.lng() - sw.lng());

  console.log("Difference", latDiff, lngDiff);
  if (latDiff > 1 || lngDiff > 1) return 3;
  if (latDiff > 0.5 || lngDiff > 0.5) return 8;
  if (latDiff > 0.1 || lngDiff > 0.1) return 10;
  if (latDiff > 0.02 || lngDiff > 0.02) return 12;
  return 14;
};

const resetAllMarkers = () => {
  const pin = new PinElement({
    scale: 1,
    background: "#EA4336",
  });

  // Fetch all gmp-advanced-marker elements
  const markers = document.querySelectorAll("gmp-advanced-marker");

  console.log("Map things", markers);
  // Loop through each marker and append the pin element
  markers.forEach((marker) => {
    while (marker.firstChild) {
      marker.removeChild(marker.firstChild);
    }
    marker.appendChild(pin.element);
  });
};

const createOverlayFunction = (marker, img, address, showOverlay = false) => {
  console.log("ShowOverlay", showOverlay);
  const overlay = document.getElementById("marker-overlay");
  const overlayImg = document.getElementById("overlay-img");
  const overlayText = document.getElementById("overlay-text");

  // Show overlay on hover
  marker.addEventListener("mouseenter", (event) => {
    overlay.style.display = "block";
    overlayImg.src =
      img ||
      "https://images.pexels.com/photos/30913847/pexels-photo-30913847/free-photo-of-indoor-artistic-scene-with-calligraphy-and-cat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    overlayText.textContent = address;

    // Position overlay near the cursor
    overlay.style.left = `${event.clientX + 15}px`;
    overlay.style.top = `${event.clientY + 15}px`;
  });

  marker.addEventListener("mouseleave", () => {
    overlay.style.display = "none";
  });

  if (showOverlay) {
    overlay.style.display = "block";
    overlayImg.src =
      img ||
      "https://images.pexels.com/photos/30913847/pexels-photo-30913847/free-photo-of-indoor-artistic-scene-with-calligraphy-and-cat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    overlayText.textContent = address;

    // const infowindow = new google.maps.InfoWindow({
    //   content: overlay,
    //   ariaLabel: "Uluru",
    // });

    // infowindow.open({
    //   anchor: marker,
    // });
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".asideHeader");
  const content = document.querySelector(".asideContent");
  const icon = document.querySelector(".toggle-icon");

  header.addEventListener("click", function () {
    const isOpen = content.style.display === "block";

    content.style.display = isOpen ? "none" : "block";
    icon.textContent = isOpen ? "▼" : "▲"; // Toggle icon direction
  });
});

window.onload = function () {
  fetchParkingSpots();
  initMap();
};
