import { getOwnerListingHistory } from "./bookingHistory.js";

const ownerId = localStorage.getItem("userId");
const bookingList = document.getElementById("bookingList");
const modal = document.getElementById("bookingModal");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-button");
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const filterButton = document.getElementById("filterButton");
const tabs = document.querySelectorAll(".tab");
const filterContainer = document.querySelector(".filter-container");

let cachedListings = [];
let oldestFirst = false;

const defaultImageURL = "https://cdn.pixabay.com/photo/2014/10/25/19/23/multi-storey-car-park-502959_1280.jpg";

// Format Firestore Timestamp
function formatTimestamp(timestamp) {
  if (!timestamp || !timestamp.seconds) return { formattedDate: "N/A", formattedTime: "N/A" };

  const date = new Date(timestamp.seconds * 1000);
  return {
    formattedDate: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
    formattedTime: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
  };
}

// Show/hide modal
function showModal() {
  modal.style.display = "block";
}

function hideModal() {
  modal.style.display = "none";
}

closeButton.addEventListener("click", hideModal);
backButton.addEventListener("click", hideModal);

window.addEventListener("click", (event) => {
  if (event.target === modal) hideModal();
});

// Calculate duration between two timestamps
function calculateDuration(start, end) {
  if (!start || !end || !start.seconds || !end.seconds) return "N/A";

  const durationMs = (end.seconds - start.seconds) * 1000;
  const durationHrs = Math.round(durationMs / (1000 * 60 * 60));

  return `${durationHrs} Hrs`;
}

// Display booking details in modal
function displayBookingDetails(listing) {
  const start = formatTimestamp(listing.start_time);
  const end = formatTimestamp(listing.end_time);

  document.getElementById("modalImage").src = listing.imgURL || defaultImageURL;

  const bookingDetails = document.getElementById("bookingDetails");
  bookingDetails.innerHTML = `
    <h3>${listing.name || "Parking Spot"}</h3>
    <p>${listing.address || "Unknown Location"}</p>
    <p>Booked by: ${listing.booked_by || "Unknown"}</p>
    <p>Date: ${start.formattedDate}</p>
    <p>Time: ${start.formattedTime} - ${end.formattedTime}</p>
    <p>Duration: ${calculateDuration(listing.start_time, listing.end_time)}</p>
    <p>Total: $${listing.price || "N/A"}</p>
  `;

  showModal();
}

// Render booking list
function renderBookingList(listings, oldestFirst = false, showOnlyCurrent = false) {
  const currentTime = Date.now() / 1000; // Convert to seconds

  // Filter bookings based on current tab
  const filteredListings = listings.filter((listing) => {
    const endTime = listing.end_time?.seconds || 0;
    return showOnlyCurrent ? endTime >= currentTime : true;
  });

  if (filteredListings.length === 0) {
    bookingList.innerHTML = `<p>${showOnlyCurrent ? "No current bookings available." : "No bookings found."}</p>`;
    return;
  }

  // Sort listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    const timeA = a.start_time?.seconds || 0;
    const timeB = b.start_time?.seconds || 0;
    return oldestFirst ? timeA - timeB : timeB - timeA;
  });

  bookingList.innerHTML = "";

  sortedListings.forEach((listing) => {
    const start = formatTimestamp(listing.start_time);
    const end = formatTimestamp(listing.end_time);

    const listItem = document.createElement("li");
    listItem.classList.add("booking-item");
    listItem.style.cursor = "pointer";

    listItem.innerHTML = `
      <img src="${listing.imgURL || defaultImageURL}" alt="Parking Image">
      <div class="booking-details">
        <h3>${listing.name || "Parking Space"}</h3>
        <p>${listing.address || "Unknown Location"}</p>
        <p>${start.formattedDate}</p>
        <p>${start.formattedTime} - ${end.formattedTime}</p>
      </div>
      <div class="arrow">></div>
    `;

    listItem.addEventListener("click", () => {
      displayBookingDetails(listing);
    });

    bookingList.appendChild(listItem);
  });
}

// Search Functionality
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const bookingItems = document.querySelectorAll(".booking-item");

  bookingItems.forEach((item) => {
    item.style.display = item.textContent.toLowerCase().includes(searchTerm) ? "flex" : "none";
  });
}

searchButton.addEventListener("click", performSearch);
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") performSearch();
});

// Filter Toggle
filterButton.addEventListener("click", () => {
  oldestFirst = !oldestFirst;
  filterButton.textContent = oldestFirst ? "Filter: Oldest to Newest" : "Filter: Newest to Oldest";
  renderBookingList(cachedListings, oldestFirst, isCurrentBookingTab());
});

// Detect Active Tab and Load Data
function isCurrentBookingTab() {
  return document.querySelector(".tab.active").textContent.trim() === "Current Booking";
}

tabs.forEach((tab) => {
  tab.addEventListener("click", function () {
    tabs.forEach((t) => t.classList.remove("active"));
    this.classList.add("active");

    const showOnlyCurrent = isCurrentBookingTab();
    renderBookingList(cachedListings, oldestFirst, showOnlyCurrent);

    filterContainer.style.display = showOnlyCurrent ? "none" : "flex";
  });
});

// Initial Load
getOwnerListingHistory(ownerId)
  .then((listings) => {
    cachedListings = listings;
    renderBookingList(listings, oldestFirst, isCurrentBookingTab());
  })
  .catch((error) => {
    console.error("Error loading booking history:", error);
    bookingList.innerHTML = "<p>Error loading bookings. Please try again later.</p>";
  });
