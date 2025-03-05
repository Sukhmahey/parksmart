import { getBooking } from "./crud.js";

document.addEventListener("DOMContentLoaded", async () => {
  const bookingId = "avPfKNywXxGVE1rnlgl6";

  try {
    const bookingData = await getBooking(bookingId);

    if (bookingData) {
      console.log("Booking Data:", bookingData);

      // Update the HTML elements with booking data
      const spotNameElement = document.getElementById("spot-name");
      const parkingDateElement = document.getElementById("parking-date");
      const parkingTimeElement = document.getElementById("parking-time");
      const parkingDurationElement =
        document.getElementById("parking-duration");
      const totalPriceElement = document.getElementById("total-price");

      if (spotNameElement) {
        spotNameElement.textContent = bookingData.space_id; // Assuming space_id is the spot name
      }
      if (parkingDateElement) {
        parkingDateElement.textContent = bookingData.start_time
          .toDate()
          .toDateString(); // Format the date
      }
      if (parkingTimeElement) {
        parkingTimeElement.textContent = `${bookingData.start_time
          .toDate()
          .toLocaleTimeString()} to ${bookingData.end_time
          .toDate()
          .toLocaleTimeString()}`;
      }
      if (parkingDurationElement) {
        // Calculate duration
        const duration =
          new Date(bookingData.end_time.toDate()) -
          new Date(bookingData.start_time.toDate());
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        parkingDurationElement.textContent = `${hours} hours ${minutes} minutes`;
      }
      if (totalPriceElement) {
        totalPriceElement.textContent = bookingData.total_price;
      }

      
    } else {
      console.error("Booking data not found.");
      // Handle the case where booking data is not found
    }
  } catch (error) {
    console.error("Error fetching booking data:", error);
    // Handle the error, e.g., display an error message to the user
  }
});
