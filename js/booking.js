document.addEventListener("DOMContentLoaded", () => {
  const bookingData = JSON.parse(localStorage.getItem("bookingData"));

  if (!bookingData) {
    alert("No booking found.");
    window.location.href = "../userPages/homepage.html";
    return;
  }

  document.getElementById("parkingTitle").textContent =
    bookingData.parkingTitle;
  document.getElementById("parkingLocation").textContent =
    bookingData.parkingLocation;
  document.getElementById("ownerName").textContent = bookingData.ownerName;
  document.getElementById("ownerContact").textContent =
    bookingData.ownerContact;
  document.getElementById("parkingDate").textContent = bookingData.parkingDate;
  document.getElementById(
    "parkingTime"
  ).textContent = `${bookingData.startTime} - ${bookingData.endTime}`;
  document.getElementById(
    "parkingDuration"
  ).textContent = `${bookingData.duration} hours`;
  document.getElementById("totalPrice").textContent = bookingData.totalPrice;

  document.getElementById("backToHome").addEventListener("click", () => {
    window.location.href = "../userPages/homepage.html";
  });
});

document.getElementById("logo").addEventListener("click", function () {
  window.location.href = "/";
});
