import { db, Timestamp } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

async function addUser(name, email, role) {
  const userRef = doc(collection(db, "users"));
  await setDoc(userRef, {
    user_id: userRef.id,
    name,
    email,
    role,
  });
  // console.log("User added:", userRef.id);
  return userRef.id;
}

async function addParkingSpace(owner_id, title, address, price_per_hour) {
  const parkingRef = doc(collection(db, "parking_spaces"));
  await setDoc(parkingRef, {
    space_id: parkingRef.id,
    owner_id,
    title,
    address,
    price_per_hour,
    created_at: new Date(),
    updated_at: new Date(),
  });
  // console.log("Parking space added:", parkingRef.id);
}

async function addBooking(
  user_id,
  space_id,
  parkingDate, // Add parkingDate as an argument
  start_time,
  end_time,
  total_price,
  license_plate,
  color
) {
  const bookingRef = doc(collection(db, "bookings"));
  // console.log("start_time:", start_time);
  // console.log("end_time:", end_time);
  // console.log("parkingDate:", parkingDate);

  // Combine date and time correctly
  const startDateTime = new Date(`${parkingDate}T${start_time}:00`); // Add ":00" for seconds
  const endDateTime = new Date(`${parkingDate}T${end_time}:00`); // Add ":00" for seconds

  // console.log("Start Time:", startDateTime);
  // console.log("End Time:", endDateTime);

  // Check if the dates are valid
  if (isNaN(startDateTime) || isNaN(endDateTime)) {
    // console.error("Invalid date:", start_time, end_time);
    return; // Exit if date is invalid
  }

  await setDoc(bookingRef, {
    booking_id: bookingRef.id,
    user_id,
    space_id,
    start_time: Timestamp.fromDate(startDateTime), // Use Firebase Timestamp
    end_time: Timestamp.fromDate(endDateTime), // Use Firebase Timestamp
    total_price,
    license_plate,
    color,
    status: "confirmed",
    created_at: Timestamp.now(),
  });
  // console.log("Booking added:", bookingRef.id);
}

// READ: Get Data from Firestore
async function getUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  snapshot.forEach((doc) => {
    // console.log(doc.id, "=>", doc.data());
  });
}

async function getParkingSpaces() {
  const snapshot = await getDocs(collection(db, "parking_spaces"));
  const dataObj = [];
  snapshot.forEach((doc) => {
    // console.log(doc.id, "=>", doc.data());
    dataObj.push(doc.data());
  });

  return dataObj;
}

async function getParkingSpaceById(documentId) {
  try {
    const docRef = doc(db, "parking_spaces", documentId); // Reference to document
    const docSnap = await getDoc(docRef); // Fetch document

    if (docSnap.exists()) {
      // console.log("Document Data:", docSnap.data());
      return docSnap.data(); // Return document data
    } else {
      // console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching document:", error);
  }
}

// UPDATE: Modify an Existing Document
async function updateUser(user_id, newData) {
  const userRef = doc(db, "users", user_id);
  await updateDoc(userRef, newData);
  console.log("User updated:", user_id);
}

// DELETE: Remove Data
async function deleteUser(user_id) {
  const userRef = doc(db, "users", user_id);
  await deleteDoc(userRef);
  console.log("User deleted:", user_id);
}

async function getBooking(booking_id) {
  console.log("Booking ID:", booking_id);

  // Reference to the specific document
  const bookingRef = doc(db, "bookings", booking_id);

  // Fetch the document
  const bookingSnap = await getDoc(bookingRef);

  if (bookingSnap.exists()) {
    console.log("Booking Data:", bookingSnap.data());
    return bookingSnap.data(); // Return the document data if it exists
  } else {
    console.error("No such booking!");
    return null; // Return null if no booking exists for the given ID
  }
}

async function fetchListingData(listingId) {
  const docRef = doc(db, "parking_spaces", listingId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) throw new Error("Listing not found");
  return { id: docSnap.id, ...docSnap.data() };
}

async function updateListing(listingId, updatedData) {
  const docRef = doc(db, "parking_spaces", listingId);
  await updateDoc(docRef, updatedData);
  console.log("Listing updated:", listingId);
}

// Export functions for use
export {
  addUser,
  addParkingSpace,
  addBooking,
  getUsers,
  getParkingSpaces,
  updateUser,
  deleteUser,
  getBooking,
  getParkingSpaceById,
  fetchListingData,
  updateListing,
};
