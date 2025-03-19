import { addBooking, getParkingSpaceById } from "../../js/crud.js";

// Function to get query parameters from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Get spaceId from URL and userId from localStorage
const spaceId = getQueryParam("spaceId");
const userId = localStorage.getItem("userId");

document.getElementById("logo").addEventListener("click", function () {
  window.location.href = "/pages/userPages/homepage.html";
});

if (!spaceId || !userId) {
  alert("Invalid access. Missing space or user ID.");
  window.location.href = "../userPages/homepage.html";
}

const parkingSpace = await getParkingSpaceById(spaceId);
console.log("parkingSpace", parkingSpace);
async function populateCheckoutDetails() {
  try {
    if (!parkingSpace) {
      alert("Parking space not found.");
      window.location.href = "../userPages/homepage.html";
      return;
    }

    // Populate parking space details
    // document.querySelector(
    //   ".image-placeholder"
    // ).style.backgroundImage = `url(${parkingSpace.image})`;
    document.querySelector(".image-placeholder").src =
      parkingSpace?.imgURL ?? "";
    document.querySelector("h2").textContent = parkingSpace.title;
    document.querySelector(".parking-info p:nth-child(2)").textContent =
      parkingSpace.address;
    document.querySelector(
      ".price"
    ).textContent = `$${parkingSpace.price_per_hour} per hour`;
  } catch (error) {
    console.error("Error fetching parking details:", error);
  }
}

// Calculate duration and total price
document.getElementById("startTime").addEventListener("input", calculatePrice);
document.getElementById("endTime").addEventListener("input", calculatePrice);

function calculatePrice() {
  const pricePerHour = parseFloat(
    document.querySelector(".price").textContent.replace("$", "")
  );
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;

  if (!startTime || !endTime) return;

  const start = new Date(`2025-01-01T${startTime}:00`);
  const end = new Date(`2025-01-01T${endTime}:00`);
  const duration = (end - start) / (1000 * 60 * 60); // Convert ms to hours

  if (duration > 0) {
    document.getElementById("duration").textContent = duration.toFixed(2);
    document.getElementById("totalPrice").textContent = (
      duration * pricePerHour
    ).toFixed(2);
  } else {
    document.getElementById("duration").textContent = "0";
    document.getElementById("totalPrice").textContent = "0.00";
  }
}

// Handle booking submission
document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const license = document.getElementById("license").value;
  const color = document.getElementById("color").value;
  const parkingDate = document.getElementById("parkingDate").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const totalPrice = document.getElementById("totalPrice").textContent;

  if (
    !license ||
    !color ||
    !parkingDate ||
    !startTime ||
    !endTime ||
    totalPrice === "0.00"
  ) {
    alert("Please fill in all details correctly.");
    return;
  }

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
      parkingSpace?.title || "",
      parkingSpace?.address || "",
      parkingSpace?.imgURL || ""
    );

    localStorage.setItem(
      "bookingData",
      JSON.stringify({
        parkingTitle: parkingSpace.title,
        parkingLocation: parkingSpace.address,
        ownerName: "John Doe", // Replace with actual owner data if available
        ownerContact: "+1 234 567 890", // Replace with actual owner contact
        parkingDate,
        startTime,
        endTime,
        duration: (
          (new Date(`2025-01-01T${endTime}:00`) -
            new Date(`2025-01-01T${startTime}:00`)) /
          (1000 * 60 * 60)
        ).toFixed(2),
        totalPrice,
      })
    );

    alert("Booking confirmed!");
    window.location.href = "../userPages/booking.html";
  } catch (error) {
    console.error("Error booking:", error);
    alert("Booking failed.");
  }
});

populateCheckoutDetails();
