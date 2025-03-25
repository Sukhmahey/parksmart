import { getParkingSpaceById } from "../../js/crud.js";

let spaceId = null;
let queryDate = "";
let spaceData = {};

const renderData = (spaceData) => {
  const imageSlider = document.getElementById("imageSlider");

  // Remove previous image to prevent duplication
  const existingImage = imageSlider.querySelector(".slider-image");
  if (existingImage) {
    existingImage.remove();
  }

  // Create a div element for the background image
  const imgElement = document.createElement("img");
  imgElement.classList.add("slider-image");
  imgElement.src = spaceData?.imgURL ?? "";

  // Insert the image before the button
  const nextButton = imageSlider.querySelector(".next");
  imageSlider.insertBefore(imgElement, nextButton);

  const section = document.getElementById("parkingDetails");
  section.classList.add("parking-details");

  const availability = spaceData?.availability
    ? Object.entries(spaceData.availability)
        .map(([day, time]) => `<p class="availability-day">${day}: ${time}</p>`)
        .join("")
    : `<p class="availability-day" >No availability info</p>`;

  // Set inner HTML with dynamic data
  section.innerHTML = `
  <div class="card">
    <h1>${spaceData?.title || "House Owner Parking"}</h1>

    <p class="description">${
      spaceData?.description ||
      "Our parking rental offers secure, convenient, and accessible spaces, designed for reliability in any situation."
    }</p>

    <p class="subtitle">
      <div class="address-container subtitle">
          <span>
              <i class="fa-solid fa-map-pin"></i> ${
                spaceData?.address || "No Address Provided"
              }
          </span>
          <button class="copy-btn" id="copy-btn" onClick="copyAddress()">Copy</button>
      </div>
    </p>

    <div class="availability-section">
        <h3>Availability:</h3>
        <div class="divider"></div>
        ${availability}
    </div>

    <div class="specs-container">
            <div class="spec-row">
                <span class="spec-header">EV Charging</span>
                <span class="spec-header">Weather Protection</span>
            </div>
            <div class="spec-row">
                <span class="spec-item">${
                  spaceData?.features?.EV_charging
                    ? "Available"
                    : "Not Available"
                }</span>
                <span class="spec-item">${
                  spaceData?.features?.covered ? "Available" : "Not Available"
                }</span>

            </div>
        </div>
    <div class="price-section">
    <div>
      <span class="daily-price">$${
        spaceData?.price_per_hour || 0
      }<span class="per-day">/hour</span></span>
      </div>
      <button class="book-btn" onclick="bookNow()">Book Now</button>
    </div>

    
</div>
  `;
};

const copyBtnId = document.getElementById("copy-btn");

const copyAddress = () => {
  navigator.clipboard
    .writeText((spaceData?.address || "").trim())
    .then(() => {
      // Optional: Show feedback
      const btn = document.querySelector(".copy-btn");
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = "Copy";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
};

copyBtnId?.addEventListener("click", (e) => {
  navigator.clipboard
    .writeText((spaceData?.address || "").trim())
    .then(() => {
      // Optional: Show feedback
      const btn = document.querySelector(".copy-btn");
      btn.textContent = "Copied!";
      setTimeout(() => {
        btn.textContent = "Copy";
      }, 2000);
    })
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
});

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

  renderData(data);
  spaceData = data;

  console.log("Search Details", data);
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
