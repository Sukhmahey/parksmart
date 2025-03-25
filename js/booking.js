document.addEventListener("DOMContentLoaded", () => {
  const bookingData = JSON.parse(localStorage.getItem("bookingData"));

  if (!bookingData) {
    alert("No booking found.");
    window.location.href = "../userPages/homepage.html";
    return;
  }

  // Update booking information
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

  // Add this block to set the parking image
  const parkingImage = document.getElementById("parkingImage");
  if (bookingData.imgURL) {
    parkingImage.src = bookingData.imgURL;
    parkingImage.style.display = "block"; // Make sure it's visible
  } else {
    parkingImage.style.display = "none"; // Hide if no image
  }

  // Event listeners
  document.getElementById("backToHome").addEventListener("click", () => {
    window.location.href = "../userPages/homepage.html";
  });

  document.getElementById("logo").addEventListener("click", () => {
    window.location.href = "/pages/userPages/homepage.html";
  });
});
