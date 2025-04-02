import { db } from "../../js/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Function to fetch the booking history of the current user
async function getUserBookingHistory() {
  try {
    // Retrieve user_id from localStorage
    const userId = localStorage.getItem("usserId");

    if (!userId) {
      console.error("User ID not found in localStorage.");
      return [];
    }

    const bookingRef = collection(db, "bookings");

    // Query to get bookings where the user is the one who made the booking, sorted by created_at
    const q = query(
      bookingRef,
      where("userId", "==", userId),
      orderBy("created_at", "desc") // Ensure Firestore indexing allows this
    );

    const snapshot = await getDocs(q);
    let bookings = [];

    snapshot.forEach((doc) => {
      bookings.push({ id: doc.id, ...doc.data() });
    });

    console.log("Sorted User Booking History:", bookings);
    return bookings;
  } catch (error) {
    console.error("Error fetching user booking history:", error);
    throw error;
  }
}

export { getUserBookingHistory };
