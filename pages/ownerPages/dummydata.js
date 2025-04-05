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
  if (!timestamp) return { formattedDate: "N/A", formattedTime: "N/A" };
  
  if (timestamp.seconds) {
    const date = new Date(timestamp.seconds * 1000);
    return {
      formattedDate: date.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }),
      formattedTime: date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
  }
  
  return { formattedDate: "N/A", formattedTime: "N/A" };
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

// Display parking space details in modal
function displayBookingDetails(listing) {
  // Use the image from the listing data
  document.getElementById("modalImage").src = listing.imgURL || listing.image || defaultImageURL;
  document.getElementById("modalImage").onerror = function() {
    this.src = defaultImageURL;
  };

  // Format created_at timestamp for display
  const createdTime = formatTimestamp(listing.created_at);
  
  // Get availability information if present
  let availabilityText = "N/A";
  if (listing.availability && listing.availability.monday) {
    availabilityText = listing.availability.monday;
  }

  const bookingDetails = document.getElementById("bookingDetails");
  bookingDetails.innerHTML = `
    <h3>${listing.title || "Parking Spot"}</h3>
    <p>${listing.address || "Unknown Location"}</p>
    <p>Owner: ${listing.owner_name || "Unknown"}</p>
    <p>Date: ${createdTime.formattedDate || "N/A"}</p>
    <p>Available Hours: ${availabilityText}</p>
    <p>Description: ${listing.description || "No description available"}</p>
    <p>Total: $${listing.price_per_hour ? listing.price_per_hour.toFixed(2) + "/hour" : "N/A"}</p>
  `;

  showModal();
}

// Render booking list with the actual data structure
function renderBookingList(listings, oldestFirst = false, showOnlyCurrent = false) {
  if (!Array.isArray(listings) || listings.length === 0) {
    bookingList.innerHTML = `<p>${showOnlyCurrent ? "No current listings available." : "No listings found."}</p>`;
    return;
  }

  // Sort listings by created_at timestamp
  const sortedListings = [...listings].sort((a, b) => {
    const timeA = a.created_at?.seconds || 0;
    const timeB = b.created_at?.seconds || 0;
    return oldestFirst ? timeA - timeB : timeB - timeA;
  });

  bookingList.innerHTML = "";

  sortedListings.forEach((listing) => {
    const createdTime = formatTimestamp(listing.created_at);

    const listItem = document.createElement("li");
    listItem.classList.add("booking-item");
    listItem.style.cursor = "pointer";

    listItem.innerHTML = `
      <img src="${listing.imgURL || listing.image || defaultImageURL}" alt="Parking Image" onerror="this.src='${defaultImageURL}'">
      <div class="booking-details">
        <h3>${listing.title || "Parking Space"}</h3>
        <p>${listing.address || "Unknown Location"}</p>
        <p>Added: ${createdTime.formattedDate}</p>
        <p>$${listing.price_per_hour || 0}/hour</p>
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
window.addEventListener('DOMContentLoaded', () => {
  try {
    getOwnerListingHistory(ownerId)
      .then((listings) => {
        if (!Array.isArray(listings)) {
          console.error("Expected array of listings but received:", listings);
          bookingList.innerHTML = "<p>Error: Invalid data format received. Please try again later.</p>";
          return;
        }
        
        console.log("Loaded listings:", listings);
        cachedListings = listings;
        renderBookingList(listings, oldestFirst, isCurrentBookingTab());
      })
      .catch((error) => {
        console.error("Error loading booking history:", error);
        bookingList.innerHTML = "<p>Error loading bookings. Please try again later.</p>";
      });
  } catch (e) {
    console.error("Critical error during initialization:", e);
    bookingList.innerHTML = "<p>Failed to initialize booking history. Please refresh the page.</p>";
  }
});