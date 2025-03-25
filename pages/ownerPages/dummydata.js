import { getOwnerListingHistory } from "./bookingHistory.js";

const ownerId = localStorage.getItem("userId");
const bookingList = document.getElementById("bookingList");
const modal = document.getElementById("bookingModal");
const closeButton = document.querySelector(".close-button");
const backButton = document.querySelector(".back-button");

// Default image URL to be used if no image is provided dynamically
const defaultImageURL = "https://cdn.pixabay.com/photo/2014/10/25/19/23/multi-storey-car-park-502959_1280.jpg";

// Function to format Firestore Timestamp to readable date and time
function formatTimestamp(timestamp) {
  if (!timestamp || !timestamp.seconds) return "Invalid Date"; // Handle errors

  const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds

  // Format date as MM/DD/YYYY
  const formattedDate = date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  });

  // Format time as hh:mm AM/PM
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return { formattedDate, formattedTime };
}

// Modal functionality
function showModal() {
  modal.style.display = "block";
}

function hideModal() {
  modal.style.display = "none";
}

// Close the modal when clicking the close button or back button
closeButton.addEventListener("click", hideModal);
backButton.addEventListener("click", hideModal);

// Close the modal when clicking outside of it
window.addEventListener("click", (event) => {
  if (event.target === modal) {
    hideModal();
  }
});

// Function to calculate duration between two timestamps
function calculateDuration(start, end) {
  if (!start || !end || !start.seconds || !end.seconds) return "N/A";
  
  const startTime = new Date(start.seconds * 1000);
  const endTime = new Date(end.seconds * 1000);
  
  const durationMs = endTime - startTime;
  const durationHrs = Math.round(durationMs / (1000 * 60 * 60));
  
  return `${durationHrs} Hrs`;
}

// Function to display booking details in modal
function displayBookingDetails(listing) {
  const start = formatTimestamp(listing.start_time);
  const end = formatTimestamp(listing.end_time);
  
  // Set the modal image dynamically:
  // If listing.photo exists, use it; otherwise, use the defaultImageURL.
  document.getElementById("modalImage").src = listing.imgURL || defaultImageURL;
  
  // Populate booking details
  const bookingDetails = document.getElementById("bookingDetails");
  bookingDetails.innerHTML = `
    <h3>${listing.name || 'House owner parking'}</h3>
    <p>${listing.address || '6542 Sussex Ave, Burnaby'}</p>
    <p>Booked by: ${listing.booked_by || 'Smart Park'}</p>
    <p>Date: ${start.formattedDate || '06/28/2025'}</p>
    <p>Time: ${start.formattedTime || '2:30pm'} - ${end.formattedTime || '4:30pm'}</p>
    <p>Duration: ${calculateDuration(listing.start_time, listing.end_time) || '2 Hrs'}</p>
    <p>Total: $${listing.price || '4'}</p>
  `;
  
  showModal();
}

// Search functionality
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");

// Add event listener for search button
searchButton.addEventListener("click", performSearch);

// Add event listener for Enter key in search input
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

function performSearch() {
  const searchTerm = searchInput.value.toLowerCase();
  const bookingItems = document.querySelectorAll(".booking-item");
  
  bookingItems.forEach((item) => {
    const text = item.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// Filter toggle functionality
const filterButton = document.getElementById("filterButton");
let oldestFirst = false; // Default is newest first

filterButton.addEventListener("click", () => {
  oldestFirst = !oldestFirst;
  filterButton.textContent = oldestFirst 
    ? "Filter: Oldest to Newest" 
    : "Filter: Newest to Oldest";
  
  // Re-render the list with new order
  renderBookingList(cachedListings, oldestFirst);
});

// Cache the listings for re-ordering without re-fetching
let cachedListings = [];

// Function to render the booking list
function renderBookingList(listings, oldestFirst = false) {
  if (listings.length === 0) {
    bookingList.innerHTML = "<p>No bookings found.</p>";
    return;
  }

  // Sort listings by date
  const sortedListings = [...listings].sort((a, b) => {
    const timeA = a.start_time?.seconds || 0;
    const timeB = b.start_time?.seconds || 0;
    return oldestFirst ? timeA - timeB : timeB - timeA;
  });

  bookingList.innerHTML = ""; // Clear existing content

  sortedListings.forEach((listing) => {
    const start = formatTimestamp(listing.start_time); // Format start time
    const end = formatTimestamp(listing.end_time); // Format end time

    const listItem = document.createElement("li");
    listItem.classList.add("booking-item");
    listItem.style.cursor = "pointer"; // Add pointer cursor

    // Dynamically set the image source:
    // Use listing.photo if available; otherwise, fall back to the defaultImageURL.
    listItem.innerHTML = `
      <img src="${listing.imgURL || defaultImageURL}" alt="Parking Image">
      <div class="booking-details">
        <h3>${listing.name || 'Parking Space'}</h3>
        <p>${listing.address || '6542 Sussex Ave, Burnaby'}</p>
        <p>${start.formattedDate || '06/28/2025'}</p>
        <p>${start.formattedTime || '2:30pm'} - ${end.formattedTime || '4:30pm'}</p>
      </div>
      <div class="arrow">></div>
    `;
    
    // Add click event listener to each list item
    listItem.addEventListener("click", () => {
      displayBookingDetails(listing);
    });

    bookingList.appendChild(listItem);
  });
}

// Fetch and display bookings
getOwnerListingHistory(ownerId).then((listings) => {
  // Cache the listings
  cachedListings = listings;
  
  // Render the list
  renderBookingList(listings, oldestFirst);
}).catch(error => {
  console.error("Error loading booking history:", error);
  bookingList.innerHTML = "<p>Error loading bookings. Please try again later.</p>";
});
