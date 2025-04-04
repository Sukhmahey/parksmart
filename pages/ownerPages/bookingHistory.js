import { db } from "../../js/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Function to fetch owner listing history (only parking spaces added by the owner)
async function getOwnerListingHistory(ownerId) {
  try {
    const parkingRef = collection(db, "parking_spaces"); // Fetch from parking_spaces, not bookings
    const q = query(parkingRef, where("user_id", "==", ownerId)); // Filter by owner ID

    const snapshot = await getDocs(q);

    let listings = [];

    snapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });

    console.log("Owner's Listing History:", listings);
    return listings;
  } catch (error) {
    console.error("Error fetching owner listing history:", error);
    throw error;
  }
}

export { getOwnerListingHistory };
