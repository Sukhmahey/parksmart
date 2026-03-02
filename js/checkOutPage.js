import { addBooking, getParkingSpaceById, getUserById } from "../../js/crud.js";

const CHECKOUT_FALLBACK_IMAGE =
  "https://images.pexels.com/photos/9800031/pexels-photo-9800031.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop";

function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

const spaceId = getQueryParam("spaceId");
const userId = localStorage.getItem("userId");
const dateTimeParam = getQueryParam("dateTime");
const parkingDate = dateTimeParam ? dateTimeParam.split("T")[0] : "";

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "/pages/userPages/homepage.html";
});

if (!spaceId || !userId) {
  alert("Invalid access. Missing space or user ID.");
  window.location.href = "/pages/userPages/homepage.html";
}

const space = await getParkingSpaceById(spaceId);
const owner = space?.user_id ? await getUserById(space.user_id) : null;

function setImageWithFallback(imgEl, url, alt = "Parking spot") {
  if (!imgEl) return;
  imgEl.alt = alt;
  imgEl.src = url && url.trim() ? url : CHECKOUT_FALLBACK_IMAGE;
  imgEl.onerror = function () {
    this.src = CHECKOUT_FALLBACK_IMAGE;
  };
}

function populateCheckoutDetails() {
  if (!space) {
    alert("Parking space not found.");
    window.location.href = "/pages/userPages/homepage.html";
    return;
  }

  const price = Number(space.price_per_hour) ?? 0;

  setImageWithFallback(
    document.getElementById("parkingImage"),
    space.imgURL,
    space.title ? `${space.title} – parking spot` : "Parking spot"
  );

  document.getElementById("parkingTitle").textContent = space.title || "Parking Spot";
  const addressEl = document.getElementById("parkingAddress");
  if (addressEl) {
    const span = addressEl.querySelector("span");
    if (span) span.textContent = space.address || "Address not provided";
    else addressEl.textContent = space.address || "Address not provided";
  }

  const descEl = document.getElementById("parkingDescription");
  if (descEl) {
    descEl.textContent = space.description || "";
    descEl.style.display = space.description ? "block" : "none";
  }

  const evEl = document.getElementById("featureEv");
  const covEl = document.getElementById("featureCovered");
  if (evEl) {
    evEl.textContent = space.features?.EV_charging ? "EV charging" : "No EV charging";
    evEl.classList.toggle("feature-available", !!space.features?.EV_charging);
  }
  if (covEl) {
    covEl.textContent = space.features?.covered ? "Covered" : "Not covered";
    covEl.classList.toggle("feature-available", !!space.features?.covered);
  }

  document.getElementById("parkingPrice").textContent = price.toFixed(2);

  const dateInput = document.getElementById("parkingDate");
  if (dateInput) {
    if (parkingDate) {
      dateInput.value = parkingDate;
      dateInput.disabled = true;
    }
  }
}

document.getElementById("startTime").addEventListener("input", calculatePrice);
document.getElementById("endTime").addEventListener("input", calculatePrice);

function calculatePrice() {
  const priceEl = document.getElementById("parkingPrice");
  const pricePerHour = parseFloat(priceEl ? priceEl.textContent.replace("$", "") : "0") || 0;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  if (!startTime || !endTime) return;

  const duration =
    (new Date(`2025-01-01T${endTime}:00`) - new Date(`2025-01-01T${startTime}:00`)) /
    (1000 * 60 * 60);
  const durationEl = document.getElementById("duration");
  const totalEl = document.getElementById("totalPrice");
  if (durationEl) durationEl.textContent = duration > 0 ? duration.toFixed(2) : "0";
  if (totalEl) totalEl.textContent = duration > 0 ? (duration * pricePerHour).toFixed(2) : "0.00";
}

function setupPopupListeners() {
  const popup = document.getElementById("confirmPopup");
  const closePopup = () => {
    popup.classList.remove("active");
    popup.setAttribute("aria-hidden", "true");
  };

  document.getElementById("cancelBooking").addEventListener("click", closePopup);
  document.getElementById("closePopup").addEventListener("click", closePopup);

  document.getElementById("confirmBooking").addEventListener("click", async () => {
    const license = document.getElementById("license").value;
    const color = document.getElementById("color").value;
    const startTime = document.getElementById("startTime").value;
    const endTime = document.getElementById("endTime").value;
    const totalPrice = document.getElementById("totalPrice").textContent;

    try {
      await addBooking(
        userId,
        spaceId,
        parkingDate,
        startTime,
        endTime,
        parseFloat(totalPrice),
        license,
        color,
        space.title,
        space.address,
        space.imgURL || ""
      );

      localStorage.setItem(
        "bookingData",
        JSON.stringify({
          parkingTitle: space.title,
          parkingLocation: space.address,
          ownerName: owner?.firstName || "",
          ownerContact: owner?.email || "",
          parkingDate,
          startTime,
          endTime,
          duration: document.getElementById("duration").textContent,
          totalPrice,
          imgURL: space.imgURL || "",
        })
      );

      closePopup();
      window.location.href = "/pages/userPages/booking.html";
    } catch (error) {
      console.error("Error booking:", error);
      alert("Booking failed. Please try again.");
      closePopup();
    }
  });
}

document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const license = document.getElementById("license").value;
  const color = document.getElementById("color").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const totalPrice = document.getElementById("totalPrice").textContent;

  if (!license || !color || !startTime || !endTime || totalPrice === "0.00") {
    alert("Please fill in all details and choose a time range.");
    return;
  }

  const duration = (
    (new Date(`2025-01-01T${endTime}:00`) - new Date(`2025-01-01T${startTime}:00`)) /
    (1000 * 60 * 60)
  ).toFixed(2);

  setImageWithFallback(
    document.getElementById("popupParkingImage"),
    space.imgURL,
    space.title ? `${space.title} – parking` : "Parking"
  );
  document.getElementById("popupParkingTitle").textContent = space.title || "Parking Spot";
  document.getElementById("popupParkingAddress").textContent = space.address || "";
  document.getElementById("popupParkingDate").textContent = parkingDate;
  document.getElementById("popupParkingTime").textContent = `${startTime} – ${endTime}`;
  document.getElementById("popupDuration").textContent = duration;
  document.getElementById("popupTotalPrice").textContent = `$${totalPrice}`;
  document.getElementById("popupLicense").textContent = license;
  document.getElementById("popupColor").textContent = color;

  document.getElementById("confirmPopup").classList.add("active");
  document.getElementById("confirmPopup").setAttribute("aria-hidden", "false");
});

populateCheckoutDetails();
setupPopupListeners();
