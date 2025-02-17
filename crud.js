const db = require("./firebase");


async function addUser(name, email, password_hash, role) {
  const userRef = db.collection("users").doc();
  await userRef.set({
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
  const parkingRef = db.collection("parking_spaces").doc();
  await parkingRef.set({
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
  const bookingRef = db.collection("bookings").doc();
  await bookingRef.set({
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
  const snapshot = await db.collection("users").get();
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });
}

async function getParkingSpaces() {
  const snapshot = await db.collection("parking_spaces").get();
  snapshot.forEach((doc) => {
    console.log(doc.id, "=>", doc.data());
  });
}

// UPDATE: Modify an Existing Document
async function updateUser(user_id, newData) {
  const userRef = db.collection("users").doc(user_id);
  await userRef.update(newData);
  console.log("User updated:", user_id);
}

// DELETE: Remove Data
async function deleteUser(user_id) {
  await db.collection("users").doc(user_id).delete();
  console.log("User deleted:", user_id);
}

// Export functions for use
module.exports = {
  addUser,
  addParkingSpace,
  addBooking,
  getUsers,
  getParkingSpaces,
  updateUser,
  deleteUser,
};
