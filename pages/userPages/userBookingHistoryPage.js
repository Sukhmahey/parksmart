import { db } from "../../js/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// DOM Elements
const elements = {
  bookingList: document.getElementById("bookingList"),
  modal: document.getElementById("bookingModal"),
  modalImage: document.getElementById("modalImage"),
  bookingDetails: document.getElementById("bookingDetails"),
  searchInput: document.getElementById("searchInput"),
  searchButton: document.getElementById("searchButton"),
  filterButton: document.getElementById("filterButton"),
  closeButton: document.querySelector(".close-button"),
  backButton: document.querySelector(".back-button"),
  backArrow: document.querySelector(".back-arrow"),
  tabs: document.querySelectorAll(".tab"),
  filterContainer: document.querySelector(".filter-container"),
};

// Constants
const defaultImageURL =
  "https://cdn.pixabay.com/photo/2014/10/25/19/23/multi-storey-car-park-502959_1280.jpg";

// State
let oldestFirst = false;
let cachedListings = [];

// Utility Functions
const formatTimestamp = (timestamp) => {
  if (!timestamp?.seconds)
    return { formattedDate: "N/A", formattedTime: "N/A" };

  const date = new Date(timestamp.seconds * 1000);
  return {
    formattedDate: date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    }),
    formattedTime: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }),
  };
};

const calculateDuration = (start, end) => {
  if (!start?.seconds || !end?.seconds) return "N/A";
  const durationHrs = ((end.seconds - start.seconds) / 3600).toFixed(1);
  return `${durationHrs} Hours`;
};

// Modal Functions
const showModal = () => (elements.modal.style.display = "block");
const hideModal = () => (elements.modal.style.display = "none");

const displayBookingDetails = (listing) => {
  const start = formatTimestamp(listing.start_time);
  const end = formatTimestamp(listing.end_time);

  elements.modImage.src = listing.imgURL || defaultImageURL;
  elements.bookingDetails.innerHTML = `
    <h3>${listing.name || "Parking Space"}</h3>
    <p>📍 ${listing.address || "Address not available"}</p>
    <p>📅 Date: ${start.formattedDate}</p>
    <p>⏰ Time: ${start.formattedTime} - ${end.formattedTime}</p>
    <p>⏳ Duration: ${calculateDuration(
      listing.start_time,
      listing.end_time
    )}</p>
    <p>💰 Total: $${listing.price?.toFixed(2) || "0.00"}</p>
  `;
  showModal();
};

// Search and Filter
const performSearch = () => {
  const searchTerm = elements.searchInput.value.toLowerCase();
  document.querySelectorAll(".booking-item").forEach((item) => {
    item.style.display = item.textContent.toLowerCase().includes(searchTerm)
      ? "flex"
      : "none";
  });
};

const toggleFilter = () => {
  oldestFirst = !oldestFirst;
  elements.filterButton.textContent = oldestFirst
    ? "Filter: Oldest to Newest"
    : "Filter: Newest to Oldest";
  renderBookingList(cachedListings, oldestFirst);
};

// Render Functions
const renderBookingList = (listings, reverse = false) => {
  if (!elements.bookingList) return;

  elements.bookingList.innerHTML = listings.length
    ? ""
    : `<p class="no-bookings">No bookings found</p>`;

  const sorted = [...listings].sort((a, b) =>
    reverse
      ? a.start_time.seconds - b.start_time.seconds
      : b.start_time.seconds - a.start_time.seconds
  );

  sorted.forEach((listing) => {
    const start = formatTimestamp(listing.start_time);
    const listItem = document.createElement("li");
    listItem.className = "booking-item";
    listItem.innerHTML = `
      <img src="${listing.imgURL || defaultImageURL}" alt="Parking">
      <div class="booking-details">
        <h3>${listing.name || "Parking Space"}</h3>
        <p>${listing.address || "Address not available"}</p>
        <p>${start.formattedDate} • ${start.formattedTime}</p>
      </div>
      <div class="arrow">›</div>
    `;
    listItem.addEventListener("click", () => displayBookingDetails(listing));
    elements.bookingList.appendChild(listItem);
  });
};

// Data Fetching
const getUserBookingHistory = async () => {
  try {
    const userId = localStorage.getItem("userId");
    if (!userId) throw new Error("User not logged in");

    const q = query(
      collection(db, "bookings"),
      where("user_id", "==", userId),
      orderBy("created_at", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Event Listeners
const setupEventListeners = () => {
  // Modal
  elements.closeButton?.addEventListener("click", hideModal);
  elements.backButton?.addEventListener("click", hideModal);
  window.addEventListener(
    "click",
    (e) => e.target === elements.modal && hideModal()
  );

  // Search
  elements.searchButton?.addEventListener("click", performSearch);
  elements.searchInput?.addEventListener(
    "keyup",
    (e) => e.key === "Enter" && performSearch()
  );

  // Filter
  elements.filterButton?.addEventListener("click", toggleFilter);

  // Tabs
  elements.tabs?.forEach((tab) => {
    tab.addEventListener("click", () => {
      elements.tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      elements.filterContainer.style.display =
        tab.textContent.trim() === "Booking History" ? "flex" : "none";
    });
  });

  // Back arrow
  elements.backArrow?.addEventListener("click", () => window.history.back());
};

// Initialization
const init = async () => {
  setupEventListeners();

  try {
    cachedListings = await getUserBookingHistory();
    renderBookingList(cachedListings);
  } catch (error) {
    elements.bookingList.innerHTML = `
      <p class="error-message">Error loading bookings. Please try again.</p>
    `;
  }
};

document.addEventListener("DOMContentLoaded", init);
