const admin = require("firebase-admin");


const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();


async function addData() {
  try {

    const userRef = db.collection("users").doc();
    await userRef.set({
      user_id: userRef.id,
      name: "John Doe",
      email: "johndoe@email.com",
      password_hash: "hashed_password",
      role: "parker", 
    });


    const parkingRef = db.collection("parking_spaces").doc();
    await parkingRef.set({
      space_id: parkingRef.id,
      owner_id: userRef.id,
      title: "Downtown Parking Spot",
      address: "123 Main Street, City",
      latitude: 37.7749,
      longitude: -122.4194,
      price_per_hour: 5.0,
      availability: { monday: "8 AM - 6 PM", tuesday: "8 AM - 6 PM" },
      features: { covered: true, EV_charging: false },
      created_at: new Date(),
      updated_at: new Date(),
    });


    const bookingRef = db.collection("bookings").doc();
    await bookingRef.set({
      booking_id: bookingRef.id,
      user_id: userRef.id,
      space_id: parkingRef.id,
      start_time: new Date(),
      end_time: new Date(Date.now() + 60 * 60 * 1000), // 1 hour later
      total_price: 5.0,
      status: "confirmed",
      created_at: new Date(),
    });


    const vehicleRef = db.collection("vehicles").doc();
    await vehicleRef.set({
      vehicle_id: vehicleRef.id,
      user_id: userRef.id,
      license_plate: "ABC123",
      make: "Toyota",
      model: "Corolla",
      year: 2020,
      color: "Blue",
    });


    const hostRef = db.collection("hosts").doc();
    await hostRef.set({
      host_id: hostRef.id,
      user_id: userRef.id,
      business_name: "Best Parking Inc.",
      address: "123 Business St, City",
      total_listings: 1,
      created_at: new Date(),
    });

    console.log("All collections and documents added successfully!");
  } catch (error) {
    console.error("Error adding data:", error);
  }
}


addData();
