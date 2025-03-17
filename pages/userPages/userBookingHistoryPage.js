import { db } from "../../js/firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Function to fetch user booking history based on userId stored in localStorage
async function fetchBookingHistory() {
  const userId = localStorage.getItem("userId");

  if (userId) {
    try {
      // Query Firestore for bookings where the userId matches the current user's ID
      const bookingsRef = collection(db, "bookings");
      const q = query(bookingsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);

      // Check if there are any bookings
      if (querySnapshot.empty) {
        console.log("No bookings found for this user.");
        return;
      }

      // Get the container where booking cards will be inserted
      const bookingContainer = document.querySelector(".mainSection");

      // Loop through each booking and create a card for it
      querySnapshot.forEach((doc) => {
        const booking = doc.data(); // Get the booking data

        // Create the booking card element
        const bookingCard = document.createElement("div");
        bookingCard.classList.add("bookingContainer");

        bookingCard.innerHTML = `
          <div class="bookingCard">
            <div class="bookingImage">
              <img src="${booking.image || "https://picsum.photos/100"}" alt="Parking Spot Image">
            </div>
            <div class="bookingInfo">
              <h2>${booking.title || "Booking Title"}</h2>
              <p>${booking.location || "Parking Spot Location"}</p>
              <p>${new Date(booking.date).toLocaleDateString() || "Parking Date"}</p>
              <p>${booking.time || "Parking Time"}</p>
            </div>
          </div>
        `;

        // Append the new booking card to the booking container
        bookingContainer.appendChild(bookingCard);
      });
    } catch (error) {
      console.error("Error fetching booking history:", error);
    }
  } else {
    console.log("No userId found in localStorage.");
  }
}

// Call the function when the page loads
fetchBookingHistory();
