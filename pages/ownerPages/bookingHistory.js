import { db } from "../../js/firebase.js";
import {
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Function to fetch owner listing history
async function getOwnerListingHistory(ownerId) {
  try {
    const parkingRef = collection(db, "bookings");
    const q = query(parkingRef, where("user_id", "==", ownerId));

    const snapshot = await getDocs(parkingRef);
      console.log(snapshot.data)
    let listings = [];

    snapshot.forEach((doc) => {
      listings.push({ id: doc.id, ...doc.data() });
    });

    console.log("Owner Listing History:", listings);
    return listings;
  } catch (error) {
    console.error("Error fetching owner listing history:", error);
    throw error;
  }
}

export { getOwnerListingHistory };