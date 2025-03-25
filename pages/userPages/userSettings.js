import {
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import { db } from "../../js/firebase.js";

async function fetchUserData() {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found in localStorage.");
    return;
  }

  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();

      // Populate fields with Firebase data
      document.getElementById("firstName").value = userData.firstName || "";
      document.getElementById("lastName").value = userData.lastName || "";
      document.getElementById("email").value = userData.email || "";
      document.getElementById("phone").value = userData.phoneNumber || ""; // Ensure correct field name
      document.getElementById("license").value = userData.license || "";
      document.getElementById("color").value = userData.color || "";
      document.getElementById("country").value = userData.country || "";
      document.getElementById("province").value = userData.province || "";
    } else {
      console.error("User data not found.");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
  }
}

document.getElementById("logo").addEventListener("click", function () {
  window.location.href = "/pages/userPages/homepage.html";
});

// Function to toggle the Edit/Save buttons and make the fields editable
function toggleEdit(section) {
  let inputs;
  if (section === "account") {
    inputs = document.querySelectorAll(
      ".settingsContainer:nth-of-type(1) input"
    );
  } else {
    inputs = document.querySelectorAll(
      ".settingsContainer:nth-of-type(2) input"
    );
  }

  inputs.forEach((input) => input.removeAttribute("readonly"));

  let editBtn = document.querySelector(
    `.${
      section === "account"
        ? "settingsContainer:nth-of-type(1)"
        : "settingsContainer:nth-of-type(2)"
    } .edit-btn`
  );
  let saveBtn = document.querySelector(
    `.${
      section === "account"
        ? "settingsContainer:nth-of-type(1)"
        : "settingsContainer:nth-of-type(2)"
    } .save-btn`
  );

  editBtn.style.display = "none";
  saveBtn.style.display = "block";
}

// Function to save the updated changes to Firebase
async function saveChanges(section) {
  const userId = localStorage.getItem("userId");
  if (!userId) {
    console.error("No userId found in localStorage.");
    return;
  }

  let inputs;
  let updatedData = {};

  if (section === "account") {
    inputs = document.querySelectorAll(
      ".settingsContainer:nth-of-type(1) input"
    );
    updatedData = {
      firstName: document.getElementById("firstName").value.trim(),
      lastName: document.getElementById("lastName").value.trim(),
      email: document.getElementById("email").value.trim(),
      phoneNumber: document.getElementById("phone").value.trim(), // Ensure correct field name
    };
  } else {
    inputs = document.querySelectorAll(
      ".settingsContainer:nth-of-type(2) input"
    );
    updatedData = {
      license: document.getElementById("license").value.trim(),
      color: document.getElementById("color").value.trim(),
      country: document.getElementById("country").value.trim(),
      province: document.getElementById("province").value.trim(),
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updatedData);
    console.log("User data updated successfully in Firebase!");

    inputs.forEach((input) => input.setAttribute("readonly", true));

    let editBtn = document.querySelector(
      `.${
        section === "account"
          ? "settingsContainer:nth-of-type(1)"
          : "settingsContainer:nth-of-type(2)"
      } .edit-btn`
    );
    let saveBtn = document.querySelector(
      `.${
        section === "account"
          ? "settingsContainer:nth-of-type(1)"
          : "settingsContainer:nth-of-type(2)"
      } .save-btn`
    );

    editBtn.style.display = "block";
    saveBtn.style.display = "none";

    alert("Changes saved successfully!");
  } catch (error) {
    console.error("Error updating user data:", error);
    alert("Failed to save changes. Please try again.");
  }
}

// Add event listeners for 'Edit' and 'Save' buttons after DOM content is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Event listeners for 'Account' section
  document
    .querySelector(".settingsContainer:nth-of-type(1) .edit-btn")
    .addEventListener("click", () => toggleEdit("account"));

  document
    .querySelector(".settingsContainer:nth-of-type(1) .save-btn")
    .addEventListener("click", () => saveChanges("account"));

  // Event listeners for 'Car' section
  document
    .querySelector(".settingsContainer:nth-of-type(2) .edit-btn")
    .addEventListener("click", () => toggleEdit("car"));

  document
    .querySelector(".settingsContainer:nth-of-type(2) .save-btn")
    .addEventListener("click", () => saveChanges("car"));

  // Fetch user data on page load
  fetchUserData();
});
