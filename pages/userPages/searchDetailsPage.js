import { getParkingSpaceById } from "../../js/crud.js";

let images = ["parking1.jpg", "parking2.jpg", "parking3.jpg"];
let currentIndex = 0;

let spaceId = null;

function nextImage() {
  currentIndex = (currentIndex + 1) % images.length;
  document.getElementById("slider").src = images[currentIndex];
}

function bookNow() {
  window.location.href = `/pages/userPages/checkOutPage.html?spaceId=${spaceId}`;
}

function resetForm() {
  document.getElementById("start-time").value = "";
  document.getElementById("end-time").value = "";
  document.getElementById("duration").innerText = "0";
  document.getElementById("total-price").innerText = "$0";
}

const renderData = (spaceData) => {
  const imageSlider = document.getElementById("imageSlider");

  // Remove previous image to prevent duplication
  const existingImage = imageSlider.querySelector(".slider-image");
  if (existingImage) {
    existingImage.remove();
  }

  // Create a div element for the background image
  const imgElement = document.createElement("div");
  imgElement.classList.add("slider-image");
  imgElement.style.backgroundImage = spaceData?.imageUrl
    ? `url(${spaceData.imageUrl})`
    : "url('https://via.placeholder.com/600x300')"; // Fallback image

  // Insert the image before the button
  const nextButton = imageSlider.querySelector(".next");
  imageSlider.insertBefore(imgElement, nextButton);

  const section = document.getElementById("parkingDetails");
  section.classList.add("parking-details");

  const availability = spaceData?.availability
    ? Object.entries(spaceData.availability)
        .map(([day, time]) => `<p>${day}: ${time}</p>`)
        .join("")
    : "<p>No availability info</p>";

  const features = spaceData?.features
    ? `
      <p>Features:</p>
      <ul>
        <li>EV Charging: ${spaceData.features.EV_charging ? "Yes" : "No"}</li>
        <li>Covered: ${spaceData.features.covered ? "Yes" : "No"}</li>
      </ul>
    `
    : "<p>No features listed.</p>";

  // Set inner HTML with dynamic data
  section.innerHTML = `
        <h2>${spaceData?.title || "House Owner Parking"}</h2>
        <p>${spaceData?.address || "No Address Provided"}</p>
        <p>Owned by: ${spaceData?.owner_name || "Unknown Owner"}</p>
        <p>Price: <span id="price">$${
          spaceData?.price_per_hour || 0
        }</span>/hr</p>

        <div class="availability">
          <h3>Availability:</h3>
          ${availability}
        </div>

        ${features}

        <div class="booking">
          <button onclick="bookNow()">Book Now</button>
        </div>
  `;

  // Append to the container

  console.log("Here", spaceData);
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

  renderData(data);

  console.log(data);
};

window.onload = function () {
  spaceId = getParam("spaceId");
  console.log("spaceId: " + spaceId);

  getSpaceData(spaceId);
};

window.goBack = goBack;
window.bookNow = bookNow;
