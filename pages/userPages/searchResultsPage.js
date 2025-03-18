import { getParkingSpaces } from "../../js/crud.js";
const { PinElement } = await google.maps.importLibrary("marker");

const bounds = new google.maps.LatLngBounds();

const mapElement = document.getElementById("map");
const filterBox = document.getElementById("filterBox");
const dateTimeInput = document.getElementById("datetime");

let userCurrentLocation = null;
let parkingSpotsArray = [];

let queryLatitude;
let queryLongitude;
let querylocation;
let queryDate;

window.onload = function () {
  initValues();
};

const initValues = () => {
  const params = new URLSearchParams(window.location.search);
  querylocation = params.get("location");
  queryLongitude = params.get("longitude");
  queryLatitude = params.get("latitude");
  queryDate = params.get("date");

  document.getElementById("location").value = querylocation;
  document.getElementById("datetime").value = queryDate;

  if (querylocation) {
    initMap();
  }
};

const destinationMarker = (coords) => {
  const marker = document.createElement("gmp-advanced-marker");

  document.querySelectorAll("gmp-advanced-marker").forEach((el) => {
    if (el.title == "Destination location") el.remove();
  });

  const { lat, lng } = coords;

  console.log("coords", coords);
  mapElement.center = { lat: Number(coords.lat), lng: Number(coords.lng) };
  marker.position = { lat: Number(coords.lat), lng: Number(coords.lng) };
  marker.title = "Destination location";

  const pin = new PinElement({
    scale: 1.3,
    background: "#41B97C",
  });

  marker.appendChild(pin.element);

  bounds.extend(new google.maps.LatLng(lat, lng));
  // Append marker to the map
  mapElement.appendChild(marker);
};

const initMap = () => {
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

          const pin = new PinElement({
            scale: 1.1,
            background: "#38C2E2",
          });

          marker.appendChild(pin.element);

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

const fetchParkingSpots = async (boundLocation) => {
  let parkingSpaceArrayUnsorted = [];

  if (!parkingSpotsArray.length) {
    parkingSpaceArrayUnsorted = await getParkingSpaces();
  } else {
    parkingSpaceArrayUnsorted = parkingSpotsArray;
  }

  let locationCoords = boundLocation ?? userCurrentLocation;

  if (!locationCoords?.lat) {
    renderListOfSpaces([]);
    return;
  } else {
    const parkingSpaceArrayDistanceIncluded = parkingSpaceArrayUnsorted.map(
      (parkingSpace) => {
        const { lat, lng } = locationCoords;
        const distance = calculateDistance(locationCoords, {
          lat: parkingSpace?.latitude,
          lng: parkingSpace?.longitude,
        });

        return {
          ...parkingSpace,
          distance: distance,
          isAvailableNow: isWithinConstraint(
            dateTimeInput.value,
            parkingSpace?.availability
          ),
        };
      }
    );

    parkingSpotsArray = parkingSpaceArrayDistanceIncluded;
    renderListOfSpaces(parkingSpaceArrayDistanceIncluded);
  }

  setTimeout(() => {
    mapElement.setAttribute(
      "center",
      `${bounds.getCenter().lat()},${bounds.getCenter().lng()}`
    );
    mapElement.setAttribute("zoom", getOptimalZoom(bounds));
  }, 500);
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

const createOverlayFunction = (
  parkingSpot = {},
  marker,
  img,
  address,
  showOverlay = false
) => {
  const overlay = document.getElementById("marker-overlay");
  const overlayImg = document.getElementById("overlay-img");
  const overlayText = document.getElementById("overlay-text");

  // Show overlay on hover
  marker.addEventListener("click", (event) => {
    showBorder(marker.id);
  });

  marker.addEventListener("mouseenter", (event) => {
    overlay.style.display = "block";
    overlayImg.src =
      img ||
      "https://images.pexels.com/photos/30913847/pexels-photo-30913847/free-photo-of-indoor-artistic-scene-with-calligraphy-and-cat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    overlayText.innerHTML = `<div class="overlayInfo"><div><span>Address:</span> ${address}</div><div><span>Distance:</span> ${(
      Number(parkingSpot?.distance) / 1000
    ).toFixed(2)}km</div></div>`;

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

function showBorder(elementId) {
  let element = document.getElementById(`${elementId}-space`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    // Transition to Gradient Border
    element.classList.add("gradient-border");

    // Transition Back to Black Border after 3 seconds
    setTimeout(() => {
      element.classList.remove("gradient-border");
      // element.style.border = "1px solid black";
    }, 3000);
  }
}

document.getElementById("filterBtn").addEventListener("click", function (e) {
  e.preventDefault();
  filterBox.style.display =
    filterBox.style.display === "block" ? "none" : "block";
});

document.getElementById("filterBoxbtn").addEventListener("click", function (e) {
  e.preventDefault();
  const selectedValue = document.getElementById("sort-options").value;
  const selectedRadiusValue = document.getElementById("radius").value;

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

  return distance.toFixed(2);
};

// Navigation
document.getElementById("logo").addEventListener("click", function () {
  window.location.href = "/";
});

// Helper functions
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

const renderListOfSpaces = (
  parkingSpaces,
  sortby = "distance",
  radius = 25
) => {
  const parkingListContainer = document.querySelector(".parking-list");
  parkingListContainer.innerHTML = "";

  const parkingSpaceSorted = (parkingSpaces || [])
    .filter((obj) => {
      return obj?.distance <= radius * 1000 && obj?.isAvailableNow;
    })
    .sort((obj1, obj2) => {
      return sortby === "distance"
        ? obj1?.distance - obj2?.distance
        : obj1?.price_per_hour - obj2?.price_per_hour;
    });

  if (!(parkingSpaceSorted || []).length) {
    const noElementMessage = document.createElement("h3");
    noElementMessage.innerHTML = "No Parking Space Found!!";
    parkingListContainer.appendChild(noElementMessage);
  }

  document.querySelectorAll("gmp-advanced-marker").forEach((el) => {
    if (el.title != "Your current location") el.remove();
  });

  destinationMarker({ lat: queryLatitude, lng: queryLongitude });
  console.log("parkingSpaceSorted", parkingSpaceSorted);

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
    marker.id = parkingSpot?.space_id;

    // Append marker to the map
    mapElement.appendChild(marker);

    createOverlayFunction(
      parkingSpot,
      marker,
      parkingSpot.imageUrl,
      parkingSpot.address
    );

    // Populating list of available spaces
    const parkingSpotElement = document.createElement("div");
    parkingSpotElement.classList.add("parking-spot");
    parkingSpotElement.id = `${parkingSpot?.space_id}-space`;

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
      window.location.href = `/pages/userPages/searchDetailsPage.html?spaceId=${parkingSpot?.space_id}&dateTime=${queryDate}`;
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

function isWithinConstraint(currentTimeAndDate, constraint) {
  // Convert the input date string to a Date object
  let date = new Date(currentTimeAndDate);
  let dayOfWeek = date
    .toLocaleString("en-US", { weekday: "long" })
    .toLowerCase(); // Get day name (e.g., "friday")

  // Check if the day exists in constraints
  if (!constraint.hasOwnProperty(dayOfWeek)) return false;

  // Parse start and end times from constraint
  let [startTime, endTime] = constraint[dayOfWeek].split(" - ").map((time) => {
    let [hour, minute] = time.match(/\d+/g).map(Number); // Extract hour and minute
    let isPM = time.includes("PM");
    if (hour === 12) isPM = !isPM; // Handle 12 AM / 12 PM correctly
    return isPM ? hour + 12 : hour; // Convert to 24-hour format
  });

  let currentHour = date.getHours();
  let currentMinute = date.getMinutes();

  // Convert current time into minutes for comparison
  let currentTotalMinutes = currentHour * 60 + currentMinute;
  let startTotalMinutes = startTime * 60;
  let endTotalMinutes = endTime * 60;

  // Return true if within the time range
  return (
    currentTotalMinutes >= startTotalMinutes &&
    currentTotalMinutes <= endTotalMinutes
  );
}

// Location Suggestions

const inputField = document.getElementById("location");
const suggestionsList = document.createElement("div");
suggestionsList.setAttribute("id", "suggestions");
inputField.parentNode.appendChild(suggestionsList);

inputField.addEventListener("input", async () => {
  const location = inputField.value.trim();

  if (location.length > 0) {
    await fetchLocationSuggestions(location);
  } else {
    suggestionsList.innerHTML = "";
  }
});

async function fetchLocationSuggestions(location) {
  const apiKey = "d79219fb6dcc45159636535b526e950f";
  try {
    const response = await fetch(
      `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
        location
      )}&apiKey=${apiKey}`
    );
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      displaySuggestions(data.features);
    } else {
      suggestionsList.innerHTML = "<p>No suggestions found.</p>";
    }
  } catch (error) {
    console.error("Error fetching location suggestions:", error);
  }
}

function displaySuggestions(features) {
  suggestionsList.innerHTML = "";

  features.forEach((feature) => {
    const suggestionItem = document.createElement("div");
    suggestionItem.classList.add("suggestion-item");
    suggestionItem.textContent = feature.properties.formatted;

    let selected = false;
    // Handle user selection of a suggestion
    suggestionItem.addEventListener("click", () => {
      inputField.value = feature.properties.formatted;
      queryLatitude = feature.properties.lat;
      queryLongitude = feature.properties.lon;

      suggestionsList.innerHTML = "";
      selected = true;
    });

    if (!selected) {
      queryLatitude = null;
      queryLongitude = null;
    }

    suggestionsList.appendChild(suggestionItem);
  });
}

// On Click Of Search
const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  suggestionsList.innerHTML = "";

  fetchParkingSpots({ lat: queryLatitude, lng: queryLongitude });
});
