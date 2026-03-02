import { getParkingSpaces } from "../../js/crud.js";

// Curated parking lots, parking spaces, and cars (Pexels – free to use)
const PARKING_SPOT_IMAGES = [
  "https://images.pexels.com/photos/9800031/pexels-photo-9800031.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop",   // solar charging lot
  "https://images.pexels.com/photos/6457089/pexels-photo-6457089.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop",   // cars on road
  "https://images.pexels.com/photos/3166786/pexels-photo-3166786.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop",   // car parked
  "https://images.pexels.com/photos/10563213/pexels-photo-10563213.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop", // car parked
  "https://images.pexels.com/photos/16350121/pexels-photo-16350121.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop", // car in lot
  "https://images.pexels.com/photos/120049/pexels-photo-120049.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop",     // parking/car
  "https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop",   // parking
  "https://images.pexels.com/photos/4483610/pexels-photo-4483610.jpeg?auto=compress&cs=tinysrgb&w=400&h=240&fit=crop",   // parking garage
];

function getParkingImageForSpot(imgURL, index) {
  if (imgURL && imgURL.trim()) return imgURL;
  return PARKING_SPOT_IMAGES[index % PARKING_SPOT_IMAGES.length];
}

const mapContainer = document.getElementById("map");
const filterBox = document.getElementById("filterBox");
const dateTimeInput = document.getElementById("datetime");

let map = null;
let bounds = null;
let userMarker = null;
let destinationMarkerRef = null;
let parkingMarkers = [];
let userCurrentLocation = null;
let parkingSpotsArray = [];

let queryLatitude;
let queryLongitude;
let querylocation;
let queryDate;
let userId = null;

// Leaflet icons (default and highlighted)
const defaultParkingIcon = L.divIcon({
  className: "leaflet-parking-marker",
  html: '<div style="background:#EA4336;width:24px;height:24px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});
const highlightedParkingIcon = L.divIcon({
  className: "leaflet-parking-marker",
  html: '<div style="background:#FBBC04;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

window.onload = function () {
  initValues();
};

const initValues = () => {
  const params = new URLSearchParams(window.location.search);
  querylocation = params.get("location");
  queryLongitude = params.get("longitude");
  queryLatitude = params.get("latitude");
  queryDate = params.get("date");
  userId = localStorage.getItem("userId");

  document.getElementById("location").value = querylocation;
  document.getElementById("datetime").value = queryDate;

  if (querylocation) {
    initMap();
  }
};

const destinationMarker = (coords) => {
  if (destinationMarkerRef) {
    map.removeLayer(destinationMarkerRef);
  }
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  destinationMarkerRef = L.marker([lat, lng], {
    icon: L.divIcon({
      className: "leaflet-dest-marker",
      html: '<div style="background:#41B97C;width:28px;height:28px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    }),
  })
    .addTo(map)
    .bindTooltip("Destination", { permanent: false });
  if (bounds) bounds.extend(L.latLng(lat, lng));
};

const initMap = () => {
  const defaultLat = queryLatitude ? Number(queryLatitude) : 37.7749;
  const defaultLng = queryLongitude ? Number(queryLongitude) : -122.4194;

  map = L.map("map").setView([defaultLat, defaultLng], 15);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  setTimeout(() => map.invalidateSize(), 0);
  window.addEventListener("resize", () => map.invalidateSize());

  bounds = L.latLngBounds(L.latLng(defaultLat, defaultLng), L.latLng(defaultLat, defaultLng));

  if (queryLatitude && queryLongitude) {
    destinationMarker({ lat: queryLatitude, lng: queryLongitude });
  }

  const requestLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          userCurrentLocation = { lat, lng };

          if (userMarker) map.removeLayer(userMarker);
          userMarker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: "leaflet-user-marker",
              html: '<div style="background:#38C2E2;width:26px;height:26px;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>',
              iconSize: [26, 26],
              iconAnchor: [13, 13],
            }),
          })
            .addTo(map)
            .bindTooltip("Your location", { permanent: false });
          bounds.extend(L.latLng(lat, lng));
          fetchParkingSpots();
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Geolocation permission denied or unavailable.");
          fetchParkingSpots();
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
      fetchParkingSpots();
    }
  };

  if (navigator.permissions) {
    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted" || result.state === "prompt") {
          requestLocation();
        } else {
          alert("Geolocation permission is denied. Please enable location services.");
          fetchParkingSpots();
        }
      })
      .catch(() => {
        requestLocation();
      });
  } else {
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

  if (userId) {
    parkingSpaceArrayUnsorted = parkingSpaceArrayUnsorted.filter(
      (parkingSpace) => parkingSpace?.user_id !== userId
    );
  }

  let locationCoords =
    boundLocation || { lat: queryLatitude, lng: queryLongitude } || userCurrentLocation;

  if (!locationCoords?.lat) {
    renderListOfSpaces([]);
    return;
  }

  const parkingSpaceArrayDistanceIncluded = parkingSpaceArrayUnsorted.map((parkingSpace) => {
    const distance = calculateDistance(locationCoords, {
      lat: parkingSpace?.latitude,
      lng: parkingSpace?.longitude,
    });
    return {
      ...parkingSpace,
      distance: distance,
      isAvailableNow:
        isWithinConstraint(dateTimeInput.value, parkingSpace?.availability) || true,
    };
  });

  parkingSpotsArray = parkingSpaceArrayDistanceIncluded;
  renderListOfSpaces(parkingSpaceArrayDistanceIncluded);

  setTimeout(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    }
  }, 300);
};

const resetAllMarkers = () => {
  parkingMarkers.forEach(({ marker }) => {
    marker.setIcon(defaultParkingIcon);
  });
};

const goBack = () => {
  window.history.back();
};

const createOverlayFunction = (parkingSpot = {}, marker, img, address, showOverlay = false) => {
  const overlay = document.getElementById("marker-overlay");
  const overlayImg = document.getElementById("overlay-img");
  const overlayText = document.getElementById("overlay-text");

  marker.on("click", () => {
    showBorder(parkingSpot?.space_id);
  });

  marker.on("mouseenter", (e) => {
    overlay.style.display = "block";
    overlayImg.src =
      img ||
      "https://images.pexels.com/photos/30913847/pexels-photo-30913847/free-photo-of-indoor-artistic-scene-with-calligraphy-and-cat.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2";
    overlayText.innerHTML = `<div class="overlayInfo"><div><span>Address:</span> ${address}</div><div><span>Distance:</span> ${(Number(parkingSpot?.distance) / 1000).toFixed(2)}km</div></div>`;
    const ev = e.originalEvent;
    overlay.style.left = `${ev.clientX + 15}px`;
    overlay.style.top = `${ev.clientY + 15}px`;
  });

  marker.on("mouseleave", () => {
    overlay.style.display = "none";
  });
};

function showBorder(elementId) {
  const element = document.getElementById(`${elementId}-space`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
    element.classList.add("gradient-border");
    setTimeout(() => element.classList.remove("gradient-border"), 3000);
  }
}

document.getElementById("filterBtn").addEventListener("click", function (e) {
  e.preventDefault();
  filterBox.style.display = filterBox.style.display === "block" ? "none" : "block";
});

document.getElementById("filterBoxbtn").addEventListener("click", function (e) {
  e.preventDefault();
  const selectedValue = document.getElementById("sort-options").value;
  const selectedRadiusValue = document.getElementById("radius").value;
  renderListOfSpaces(parkingSpotsArray, selectedValue, selectedRadiusValue);
  filterBox.style.display = filterBox.style.display === "block" ? "none" : "block";
});

function calculateDistance(obj1, obj2) {
  const R = 6371e3; // metres
  const φ1 = (obj1?.lat * Math.PI) / 180;
  const φ2 = (obj2?.lat * Math.PI) / 180;
  const Δφ = ((obj2?.lat - obj1?.lat) * Math.PI) / 180;
  const Δλ = ((obj2?.lng - obj1?.lng) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
}

document.getElementById("logo")?.addEventListener("click", function () {
  window.location.href = "/pages/userPages/homepage.html";
});

const getOptimalZoom = (b) => {
  if (!b || !b.isValid()) return 14;
  const ne = b.getNorthEast();
  const sw = b.getSouthWest();
  const latDiff = Math.abs(ne.lat - sw.lat);
  const lngDiff = Math.abs(ne.lng - sw.lng);
  if (latDiff > 1 || lngDiff > 1) return 4;
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
    .filter((obj) => obj?.distance <= radius * 1000 && obj?.isAvailableNow)
    .sort((obj1, obj2) =>
      sortby === "distance" ? obj1?.distance - obj2?.distance : obj1?.price_per_hour - obj2?.price_per_hour
    );

  if (!(parkingSpaceSorted || []).length) {
    const noElementMessage = document.createElement("p");
    noElementMessage.className = "parking-list-empty";
    noElementMessage.textContent = "No parking spaces found. Try a different location or radius.";
    parkingListContainer.appendChild(noElementMessage);
  }

  parkingMarkers.forEach(({ marker }) => map.removeLayer(marker));
  parkingMarkers = [];

  destinationMarker({ lat: queryLatitude, lng: queryLongitude });

  parkingSpaceSorted.forEach((parkingSpot, index) => {
    bounds.extend(L.latLng(parkingSpot?.latitude, parkingSpot?.longitude));

    const marker = L.marker([parkingSpot?.latitude, parkingSpot?.longitude], {
      icon: defaultParkingIcon,
    }).addTo(map);
    marker.spaceId = parkingSpot?.space_id;

    const spotImageUrl = getParkingImageForSpot(parkingSpot?.imgURL, index);
    createOverlayFunction(
      parkingSpot,
      marker,
      spotImageUrl,
      parkingSpot?.address || "Address not set"
    );
    parkingMarkers.push({ marker, parkingSpot });

    const parkingSpotElement = document.createElement("div");
    parkingSpotElement.classList.add("parking-spot");
    parkingSpotElement.id = `${parkingSpot?.space_id}-space`;

    const spotImage = document.createElement("img");
    spotImage.classList.add("spot-image");
    spotImage.alt = parkingSpot?.title ? `Parking: ${parkingSpot.title}` : "Parking spot";
    spotImage.src = spotImageUrl;
    spotImage.onerror = function () {
      this.src = PARKING_SPOT_IMAGES[0];
    };

    const spotInfo = document.createElement("div");
    spotInfo.classList.add("spot-info");

    const spotName = document.createElement("h4");
    spotName.classList.add("spot-name");
    spotName.textContent = parkingSpot.title || "Parking Spot";

    const spotLocation = document.createElement("p");
    spotLocation.classList.add("spot-address");
    spotLocation.textContent = parkingSpot.address || "—";

    const spotMeta = document.createElement("div");
    spotMeta.classList.add("spot-meta");
    const spotDistance = document.createElement("span");
    spotDistance.classList.add("spot-distance");
    spotDistance.textContent = `\u2022 ${(parkingSpot?.distance / 1000).toFixed(1)} km`;
    const pricePerHour = document.createElement("span");
    pricePerHour.classList.add("spot-price");
    pricePerHour.textContent = `$${parkingSpot?.price_per_hour ?? 0}/hr`;
    spotMeta.appendChild(spotDistance);
    spotMeta.appendChild(pricePerHour);

    const spotDetailsBtn = document.createElement("button");
    spotDetailsBtn.classList.add("spot-details-btn");
    spotDetailsBtn.textContent = "View details";
    spotDetailsBtn.addEventListener("click", () => {
      window.location.href = `/pages/userPages/searchDetailsPage.html?spaceId=${parkingSpot?.space_id}&dateTime=${queryDate}`;
    });

    spotInfo.appendChild(spotName);
    spotInfo.appendChild(spotLocation);
    spotInfo.appendChild(spotMeta);
    spotInfo.appendChild(spotDetailsBtn);

    parkingSpotElement.appendChild(spotImage);
    parkingSpotElement.appendChild(spotInfo);

    parkingSpotElement.addEventListener("click", () => {
      resetAllMarkers();
      map.setView([parkingSpot?.latitude, parkingSpot?.longitude], 16);
      marker.setIcon(highlightedParkingIcon);
    });

    parkingListContainer.appendChild(parkingSpotElement);
  });
};

function isWithinConstraint(currentTimeAndDate, constraint) {
  let date = new Date(currentTimeAndDate);
  let dayOfWeek = date.toLocaleString("en-US", { weekday: "long" }).toLowerCase();
  if (!constraint.hasOwnProperty(dayOfWeek)) return false;
  let [startTime, endTime] = constraint[dayOfWeek].split(" - ").map((time) => {
    let [hour, minute] = time.match(/\d+/g).map(Number);
    let isPM = time.includes("PM");
    if (hour === 12) isPM = !isPM;
    return isPM ? hour + 12 : hour;
  });
  let currentHour = date.getHours();
  let currentMinute = date.getMinutes();
  let currentTotalMinutes = currentHour * 60 + currentMinute;
  let startTotalMinutes = startTime * 60;
  let endTotalMinutes = endTime * 60;
  return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
}

// Location Suggestions
const inputField = document.getElementById("location");
const container = inputField ? (inputField.closest(".searchInputContainer") || inputField.parentNode) : null;
let suggestionsList = document.getElementById("suggestions");

if (inputField && container) {
  if (!suggestionsList) {
    suggestionsList = document.createElement("div");
    suggestionsList.setAttribute("id", "suggestions");
    suggestionsList.setAttribute("role", "listbox");
    container.style.position = "relative";
    container.appendChild(suggestionsList);
  }

  let debounceTimer = null;

  function showSuggestions(html) {
    suggestionsList.innerHTML = html;
    suggestionsList.classList.add("suggestions-visible");
  }

  function hideSuggestions() {
    suggestionsList.innerHTML = "";
    suggestionsList.classList.remove("suggestions-visible");
  }

  inputField.addEventListener("input", () => {
    const location = inputField.value.trim();
    clearTimeout(debounceTimer);
    if (location.length === 0) {
      hideSuggestions();
      return;
    }
    showSuggestions('<div class="suggestion-loading">Searching...</div>');
    debounceTimer = setTimeout(async () => {
      await fetchLocationSuggestions(location);
    }, 280);
  });

  inputField.addEventListener("focus", () => {
    if (inputField.value.trim().length > 0 && suggestionsList.children.length > 0) {
      suggestionsList.classList.add("suggestions-visible");
    }
  });

  async function fetchLocationSuggestions(location) {
    const apiKey = "d79219fb6dcc45159636535b526e950f";
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(location)}&apiKey=${apiKey}&limit=8`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        displaySuggestions(data.features);
      } else {
        showSuggestions('<div class="suggestion-empty">No locations found. Try a different search.</div>');
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      showSuggestions('<div class="suggestion-error">Unable to load suggestions. Check your connection.</div>');
    }
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function getCurrentDateTimeLocal() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function displaySuggestions(features) {
    suggestionsList.innerHTML = "";
    suggestionsList.classList.add("suggestions-visible");
    const dateTimeInput = document.getElementById("datetime");
    features.forEach((feature) => {
      const props = feature.properties;
      const formatted = props.formatted || "";
      const secondLine = [props.city, props.state, props.country].filter(Boolean).join(", ") || null;
      const suggestionItem = document.createElement("div");
      suggestionItem.classList.add("suggestion-item");
      suggestionItem.setAttribute("role", "option");
      suggestionItem.innerHTML = secondLine
        ? `<span class="suggestion-main">${escapeHtml(formatted)}</span><span class="suggestion-sub">${escapeHtml(secondLine)}</span>`
        : `<span class="suggestion-main">${escapeHtml(formatted)}</span>`;
      suggestionItem.addEventListener("click", () => {
        inputField.value = formatted;
        queryLatitude = props.lat;
        queryLongitude = props.lon;
        if (dateTimeInput) dateTimeInput.value = getCurrentDateTimeLocal();
        hideSuggestions();
      });
      suggestionsList.appendChild(suggestionItem);
    });
  }

  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) hideSuggestions();
  });
}

const searchBtn = document.getElementById("searchBtn");
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (suggestionsList) suggestionsList.innerHTML = "";
  fetchParkingSpots({ lat: queryLatitude, lng: queryLongitude });
});

window.goBack = goBack;
