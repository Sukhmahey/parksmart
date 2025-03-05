import db, { auth } from "./firebase.js";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";


import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// User Authentication Logic (Moved from loginPage.js)
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");

if (signUpForm) {
  signUpForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const isSpaceOwner = document.getElementById("isSpaceOwner").checked;  

    // checkbox for determing role 
    const role = isSpaceOwner ? "spaceOwner" : "user";

    createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("Account Created Successfully!");
            console.log("User Created:", userCredential.user);
            // Adding data to the firebase
            addUser(name, email, password, role);
        })
        .catch((error) => {
            alert(error.message);
        });
});

}


if (signInForm) {
    signInForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signinEmail").value;
        const password = document.getElementById("signinPassword").value;

        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Login Successful!");
                window.location.href = "homepage.html"; // Redirect after login
            })
            .catch((error) => {
                alert(error.message);
            });
    });
}

//logout function, but not implemented yet dont know where we are putting the logout button yet.
// import { signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// async function logout() {
//     try {
//         await signOut(auth);
//         console.log("User logged out");
//         window.location.href = "loginPage.html"; // Redirect to login page after logout
//     } catch (error) {
//         console.error("Logout Error:", error.message);
//     }
// }

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

async function addParkingSpace(owner_id, title, address, price_per_hour,image,longitude,latitude,availability = {},features = []) {
  const parkingRef = doc(collection(db, "parking_spaces"));
  await setDoc(parkingRef, {
    space_id: parkingRef.id,
    owner_id,
    title,
    address,
    price_per_hour,
    image,
    longitude,
    latitude,
    availability,
    features,
    created_at: new Date(),
    updated_at: new Date(),
  });
  console.log("Parking space added:", parkingRef.id);
}
async function deleteParkingSpace(spaceId) {
  try {
    const parkingRef = doc(db, "parking_spaces", spaceId);
    await deleteDoc(parkingRef);
    console.log("Parking space deleted:", spaceId);
    return true;
  } catch (error) {
    console.error("Error deleting parking space:", error);
    throw error;
  }
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
  deleteParkingSpace
};
