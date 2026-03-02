import { getParkingSpaceById } from "../../js/crud.js";

let spaceId = null;
let queryDate = "";
let spaceData = {};

const DETAIL_FALLBACK_IMAGE =
  "https://images.pexels.com/photos/9800031/pexels-photo-9800031.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop";

const renderData = (spaceData) => {
  const imageSlider = document.getElementById("imageSlider");
  if (!imageSlider) return;

  imageSlider.innerHTML = "";
  const imgElement = document.createElement("img");
  imgElement.classList.add("slider-image");
  imgElement.alt = spaceData?.title ? `${spaceData.title} – parking spot` : "Parking spot";
  imgElement.src = spaceData?.imgURL || DETAIL_FALLBACK_IMAGE;
  imgElement.loading = "eager";
  imgElement.onerror = function () {
    this.src = DETAIL_FALLBACK_IMAGE;
  };
  imageSlider.appendChild(imgElement);

  const section = document.getElementById("parkingDetails");
  section.classList.add("parking-details");

  const availability = spaceData?.availability
    ? Object.entries(spaceData.availability)
        .map(([day, time]) => `<p class="availability-day">${day}: ${time}</p>`)
        .join("")
    : `<p class="availability-day" >No availability info</p>`;

  // Set inner HTML with dynamic data
  section.innerHTML = `
  <div class="card detail-card">
    <h1 class="detail-title">${escapeHtml(spaceData?.title || "Parking Spot")}</h1>

    <p class="description">${
      escapeHtml(
        spaceData?.description ||
          "Secure, convenient parking space. Book for an hour or longer."
      )
    }</p>

    <div class="address-container detail-address">
      <span class="address-text">
        <i class="fa-solid fa-map-pin" aria-hidden="true"></i>
        ${escapeHtml(spaceData?.address || "Address not provided")}
      </span>
      <button type="button" class="copy-btn" onclick="copyAddress()">Copy</button>
    </div>

    <div class="availability-section">
      <h3 class="availability-heading">Availability</h3>
      <div class="divider"></div>
      <div class="availability-grid">${availability}</div>
    </div>

    <div class="specs-container">
      <div class="spec-row">
        <span class="spec-label">EV Charging</span>
        <span class="spec-value">${
          spaceData?.features?.EV_charging ? "Available" : "Not available"
        }</span>
      </div>
      <div class="spec-row">
        <span class="spec-label">Covered</span>
        <span class="spec-value">${
          spaceData?.features?.covered ? "Available" : "Not available"
        }</span>
      </div>
    </div>

    <div class="price-section">
      <div class="price-block">
        <span class="daily-price">$${Number(spaceData?.price_per_hour ?? 0).toFixed(2)}</span>
        <span class="per-day">/hour</span>
      </div>
      <button type="button" class="book-btn" onclick="bookNow()">Book Now</button>
    </div>
  </div>
  `;
};

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

const copyAddress = () => {
  navigator.clipboard
    .writeText((spaceData?.address || "").trim())
    .then(() => {
      const btn = document.querySelector(".copy-btn");
      if (btn) {
        btn.textContent = "Copied!";
        setTimeout(() => { btn.textContent = "Copy"; }, 2000);
      }
    })
    .catch((err) => console.error("Failed to copy:", err));
};

const getParam = (key) => {
  const queryString = window.location.search; // Get "?name=John&age=25"
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(key);
};

const goBack = () => {
  window.history.back();
};

const getSpaceData = async (spaceIdRef) => {
  const data = await getParkingSpaceById(spaceIdRef);
  if (!data) {
    document.getElementById("parkingDetails").innerHTML =
      "<p class='detail-error'>Parking spot not found.</p>";
    return;
  }
  spaceData = data;
  renderData(data);
};

const bookNow = () => {
  window.location.href = `/pages/userPages/checkOutPage.html?spaceId=${spaceId}&dateTime=${queryDate}`;
};

window.onload = function () {
  spaceId = getParam("spaceId");
  queryDate = getParam("dateTime");
  getSpaceData(spaceId);
};

window.goBack = goBack;
window.bookNow = bookNow;
window.copyAddress = copyAddress;
