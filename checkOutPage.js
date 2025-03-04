import { addBooking } from "../crud.js";

document.addEventListener("DOMContentLoaded", function () {
  const parkingDateInput = document.getElementById("parkingDate");
  const startTimeInput = document.getElementById("startTime");
  const endTimeInput = document.getElementById("endTime");
  const durationDisplay = document.getElementById("duration");
  const totalPriceDisplay = document.getElementById("totalPrice");
  const parkingDate = parkingDateInput.value;

  const pricePerHour = 5;

  function calculateDurationAndPrice() {
    console.log(parkingDate);

    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;

    if (parkingDate && startTime && endTime) {
      const start = new Date(`${parkingDate}T${startTime}`);
      const end = new Date(`${parkingDate}T${endTime}`);
      console.log(start, end);

      if (end > start) {
        const duration = (end - start) / (1000 * 60 * 60);
        durationDisplay.textContent = duration.toFixed(2);

        const totalPrice = duration * pricePerHour;
        totalPriceDisplay.textContent = totalPrice.toFixed(2);
      } else {
        durationDisplay.textContent = "0";
        totalPriceDisplay.textContent = "0.00";
      }
    }
  }

  const form = document.querySelector("form");

  form.addEventListener("submit", async (e) => {
    console.log("Form submitted");

    e.preventDefault();

    const licensePlate = document.getElementById("license").value;
    const color = document.getElementById("color").value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const totalPrice = parseFloat(totalPriceDisplay.textContent); 

    const userId = "JCDexqzzhvRDOZXi188R"; 
    const spaceId = "OHSWzPzplsw9v5k7oYWh"; 

    try {
      await addBooking(
        userId,
        spaceId,
        parkingDate,
        startTime,
        endTime,
        totalPrice,
        licensePlate,
        color
      );
      console.log("Booking added successfully!");
    } catch (error) {
      console.error("Error adding booking:", error);
    }
  });

  parkingDateInput.addEventListener("change", calculateDurationAndPrice);
  startTimeInput.addEventListener("change", calculateDurationAndPrice);
  endTimeInput.addEventListener("change", calculateDurationAndPrice);
});
