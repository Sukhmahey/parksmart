import db from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

async function addUser(name, email, password_hash, role) {
  const userRef = doc(collection(db, "users"));
  await setDoc(userRef, {
    user_id: userRef.id,
    name,
    email,
    password_hash,
    role,
  });
  console.log("User added:", userRef.id);
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
  console.log("Parking space added:", parkingRef.id);
}

async function addBooking(
  user_id,
  space_id,
  start_time,
  end_time,
  total_price
) {
  const bookingRef = doc(collection(db, "bookings"));
  await setDoc(bookingRef, {
    booking_id: bookingRef.id,
    user_id,
    space_id,
    start_time: new Date(start_time),
    end_time: new Date(end_time),
    total_price,
    status: "confirmed",
    created_at: new Date(),
  });
  console.log("Booking added:", bookingRef.id);
}

// READ: Get Data from Firestore
async function getUsers() {
  const snapshot = await getDocs(collection(db, "users"));
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });
}

async function getParkingSpaces() {
  const snapshot = await getDocs(collection(db, "parking_spaces"));
  const dataObj = [];
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
    dataObj.push(doc.data());
  });

  return dataObj;
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

// Export functions for use
export {
  addUser,
  addParkingSpace,
  addBooking,
  getUsers,
  getParkingSpaces,
  updateUser,
  deleteUser,
};
