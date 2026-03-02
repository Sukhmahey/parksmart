const BOOKING_FALLBACK_IMAGE =
  "https://images.pexels.com/photos/9800031/pexels-photo-9800031.jpeg?auto=compress&cs=tinysrgb&w=800&h=500&fit=crop";

document.addEventListener("DOMContentLoaded", () => {
  const bookingData = JSON.parse(localStorage.getItem("bookingData"));

  if (!bookingData) {
    alert("No booking found.");
    window.location.href = "/pages/userPages/homepage.html";
    return;
  }

  document.getElementById("parkingTitle").textContent = bookingData.parkingTitle || "Parking spot";
  const locationEl = document.getElementById("parkingLocation");
  const locationSpan = locationEl?.querySelector("span");
  if (locationSpan) locationSpan.textContent = bookingData.parkingLocation || "—";
  else if (locationEl) locationEl.textContent = bookingData.parkingLocation || "—";

  document.getElementById("ownerName").textContent = bookingData.ownerName || "—";
  const contactEl = document.getElementById("ownerContact");
  if (contactEl) {
    const email = bookingData.ownerContact || "";
    contactEl.href = email ? `mailto:${email}` : "#";
    contactEl.textContent = email || "—";
  }

  document.getElementById("parkingDate").textContent = bookingData.parkingDate || "—";
  document.getElementById("parkingTime").textContent =
    bookingData.startTime && bookingData.endTime
      ? `${bookingData.startTime} – ${bookingData.endTime}`
      : "—";
  document.getElementById("parkingDuration").textContent =
    bookingData.duration != null ? `${bookingData.duration} hours` : "—";
  document.getElementById("totalPrice").textContent =
    bookingData.totalPrice != null ? `$${bookingData.totalPrice}` : "$0.00";

  const parkingImage = document.getElementById("parkingImage");
  if (parkingImage) {
    const url = bookingData.imgURL && bookingData.imgURL.trim() ? bookingData.imgURL : BOOKING_FALLBACK_IMAGE;
    parkingImage.src = url;
    parkingImage.alt = bookingData.parkingTitle ? `${bookingData.parkingTitle} – parking spot` : "Parking spot";
    parkingImage.onerror = function () {
      this.src = BOOKING_FALLBACK_IMAGE;
    };
  }

  document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "/pages/userPages/homepage.html";
  });
});
