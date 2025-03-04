import { getParkingSpaces } from "../../js/crud.js";
const { Map, InfoWindow } = await google.maps.importLibrary("maps");
const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary(
  "marker"
);

const bounds = new google.maps.LatLngBounds();

const mapElement = document.getElementById("map");
const filterBox = document.getElementById("filterBox");

let userCurrentLocation = null;
let parkingSpotsArray = [];

const initMap = () => {
  // const markerElement = document.getElementById("marker");
  const marker = document.createElement("gmp-advanced-marker");

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          userCurrentLocation = { lat, lng };

          mapElement.center = { lat, lng };
          marker.position = { lat, lng };
          marker.title = "Your current location";

          bounds.extend(new google.maps.LatLng(lat, lng));
          // Append marker to the map
          mapElement.appendChild(marker);
          fetchParkingSpots();
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
  const parkingSpaceArrayUnsorted = await getParkingSpaces();

  const parkingSpaceArrayDistanceIncluded = parkingSpaceArrayUnsorted.map(
    (parkingSpace) => {
      const { lat, lng } = userCurrentLocation;
      const distance = calculateDistance(userCurrentLocation, {
        lat: parkingSpace?.latitude,
        lng: parkingSpace?.longitude,
      });

      return { ...parkingSpace, distance: distance };
    }
  );

  parkingSpotsArray = parkingSpaceArrayDistanceIncluded;
  renderListOfSpaces(parkingSpaceArrayDistanceIncluded);

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

  // Loop through each marker and append the pin element
  markers.forEach((marker) => {
    while (marker.firstChild) {
      marker.removeChild(marker.firstChild);
    }
    marker.appendChild(pin.element);
  });
};

const renderListOfSpaces = (
  parkingSpaces,
  sortby = "distance",
  radius = 10
) => {
  const parkingListContainer = document.querySelector(".parking-list");
  parkingListContainer.innerHTML = "";

  const parkingSpaceSorted = parkingSpaces
    ?.filter((obj) => obj?.distance <= radius * 1000)
    .sort((obj1, obj2) => {
      return sortby === "distance"
        ? obj1?.distance - obj2?.distance
        : obj1?.price_per_hour - obj2?.price_per_hour;
    });

  console.log("Parking", sortby, parkingSpaceSorted);

  parkingSpaceSorted.forEach((parkingSpot) => {
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

    const spotDistance = document.createElement("p");
    spotDistance.textContent = `Distance: ${(
      parkingSpot?.distance / 1000
    ).toFixed(2)}km`;

    // Price Per Hour
    const pricePerHour = document.createElement("p");
    pricePerHour.textContent = `Price per hour: $${parkingSpot.price_per_hour}`;

    // Price Per Hour
    const spotDetailsBtn = document.createElement("button");
    spotDetailsBtn.textContent = `Go To Details`;

    spotDetailsBtn.addEventListener("click", () => {
      window.location.href = `/pages/userPages/searchDetailsPage.html?spaceId=${parkingSpot?.space_id}`;
    });

    // Append elements to the spot-info div
    spotInfo.appendChild(spotName);
    spotInfo.appendChild(spotLocation);
    spotInfo.appendChild(pricePerHour);
    if (parkingSpot?.distance) spotInfo.appendChild(spotDistance);
    spotInfo.appendChild(spotDetailsBtn);

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

      let hasSameChild = false;

      for (const child of marker.childNodes) {
        // You can use a condition to compare the child (for example, check the type or other properties)
        if (JSON.stringify(child) === JSON.stringify(pin.element)) {
          hasSameChild = true;
          break;
        }
      }

      if (!hasSameChild) {
        marker.appendChild(pin.element);
      }
    });

    // Append the parking spot element to the parking-list container
    parkingListContainer.appendChild(parkingSpotElement);
  });
};

const createOverlayFunction = (marker, img, address, showOverlay = false) => {
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
  }
};

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".asideHeader");
  const content = document.querySelector(".asideContent");
  const contentHeader = document.querySelector(".asideHeaderContainer");
  const icon = document.querySelector(".toggle-icon");

  header.addEventListener("click", function () {
    const isOpen = contentHeader.style.display === "block";

    contentHeader.style.display = isOpen ? "none" : "block";
  });
});

document.getElementById("filterBtn").addEventListener("click", function () {
  filterBox.style.display =
    filterBox.style.display === "block" ? "none" : "block";
});

document.getElementById("filterBoxbtn").addEventListener("click", function () {
  const selectedValue = document.getElementById("sort-options").value;
  const selectedRadiusValue = document.getElementById("radius").value;
  console.log("Selected Sort Option:", selectedValue, selectedRadiusValue);

  renderListOfSpaces(parkingSpotsArray, selectedValue, selectedRadiusValue);

  filterBox.style.display =
    filterBox.style.display === "block" ? "none" : "block";
});

const calculateDistance = (obj1, obj2) => {
  // Create LatLng objects
  const point1 = new google.maps.LatLng(obj1?.lat, obj1?.lng);
  const point2 = new google.maps.LatLng(obj2?.lat, obj2?.lng);

  // Compute distance in meters
  const distance = google.maps.geometry.spherical.computeDistanceBetween(
    point1,
    point2
  );

  console.log("Distance", distance.toFixed(2));
  return distance.toFixed(2);
};

window.onload = function () {
  initMap();
};
