import { addBooking, getParkingSpaceById, getUserById } from "../../js/crud.js";

// Get query parameters
function getQueryParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

const spaceId = getQueryParam("spaceId");
const userId = localStorage.getItem("userId");
const parkingDate = getQueryParam("dateTime").split("T")[0];

document.getElementById("parkingDate").value = parkingDate;
document.getElementById("parkingDate").disabled = true;

document.getElementById("logo").addEventListener("click", () => {
  window.location.href = "/pages/userPages/homepage.html";
});

if (!spaceId || !userId) {
  alert("Invalid access. Missing space or user ID.");
  window.location.href = "../userPages/homepage.html";
}

const space = await getParkingSpaceById(spaceId);
const owner = space?.user_id ? await getUserById(space.user_id) : null;

async function populateCheckoutDetails() {
  if (!space) {
    alert("Parking space not found.");
    window.location.href = "../userPages/homepage.html";
    return;
  }

  // Update these lines to match new HTML structure
  document.getElementById("parkingImage").src = space.imgURL || "";
  document.getElementById("parkingTitle").textContent = space.title;
  document.getElementById("parkingAddress").textContent = space.address;
  document.getElementById("parkingPrice").textContent = space.price_per_hour;
}
document.getElementById("startTime").addEventListener("input", calculatePrice);
document.getElementById("endTime").addEventListener("input", calculatePrice);

function calculatePrice() {
  const pricePerHour = parseFloat(
    document.querySelector(".price").textContent.replace("$", "")
  );
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  if (!startTime || !endTime) return;

  const duration =
    (new Date(`2025-01-01T${endTime}:00`) -
      new Date(`2025-01-01T${startTime}:00`)) /
    (1000 * 60 * 60);
  document.getElementById("duration").textContent =
    duration > 0 ? duration.toFixed(2) : "0";
  document.getElementById("totalPrice").textContent =
    duration > 0 ? (duration * pricePerHour).toFixed(2) : "0.00";
}

document.querySelector("form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const license = document.getElementById("license").value;
  const color = document.getElementById("color").value;
  const startTime = document.getElementById("startTime").value;
  const endTime = document.getElementById("endTime").value;
  const totalPrice = document.getElementById("totalPrice").textContent;

  if (!license || !color || !startTime || !endTime || totalPrice === "0.00") {
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
        duration: (
          (new Date(`2025-01-01T${endTime}:00`) -
            new Date(`2025-01-01T${startTime}:00`)) /
          (1000 * 60 * 60)
        ).toFixed(2),
        totalPrice,
        imgURL: space.imgURL || "",
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
