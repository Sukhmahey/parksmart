import {
  doc,
  updateDoc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
import {
  getAuth,
  updatePassword,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { db } from "../../js/firebase.js";

const auth = getAuth();

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

      document.getElementById("firstName").value = userData.firstName || "";
      document.getElementById("lastName").value = userData.lastName || "";
      document.getElementById("email").value = userData.email || "";
      document.getElementById("phone").value = userData.phoneNumber || "";
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

function toggleEdit(section) {
  let inputs;
  if (section === "account") {
    inputs = document.querySelectorAll(
      ".settingsContainer:nth-of-type(1) input"
    );
  }

  inputs.forEach((input) => input.removeAttribute("readonly"));

  document.querySelector(".edit-btn").style.display = "none";
  document.querySelector(".save-btn").style.display = "block";

  // Show "Change Password" button if it doesn't exist
  if (!document.getElementById("changePasswordBtn")) {
    const changePasswordBtn = document.createElement("button");
    changePasswordBtn.id = "changePasswordBtn";
    changePasswordBtn.textContent = "Change Password";
    changePasswordBtn.addEventListener("click", showPasswordFields);
    document.querySelector(".buttons").prepend(changePasswordBtn);
  }
}

function showPasswordFields() {
  const passwordFields = document.getElementById("passwordFields");
  passwordFields.style.display = "block";
  document.getElementById("changePasswordBtn").style.display = "none";
}

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
      phoneNumber: document.getElementById("phone").value.trim(),
    };
  }

  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, updatedData);
    console.log("User data updated successfully in Firebase!");

    inputs.forEach((input) => input.setAttribute("readonly", true));
    document.querySelector(".edit-btn").style.display = "block";
    document.querySelector(".save-btn").style.display = "none";

    // If password fields are visible, try to change password
    const passwordFields = document.getElementById("passwordFields");
    if (passwordFields.style.display === "block") {
      const newPassword = document.getElementById("newPassword").value.trim();
      const confirmPassword = document
        .getElementById("confirmPassword")
        .value.trim();

      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              await updatePassword(user, newPassword);
              alert("Password changed successfully!");
            } catch (error) {
              console.error("Error updating password:", error);
              alert("Failed to change password. You may need to log in again.");
            }
          }
        });
      }
    }

    alert("Changes saved successfully!");
  } catch (error) {
    console.error("Error updating user data:", error);
    alert("Failed to save changes. Please try again.");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document
    .querySelector(".settingsContainer:nth-of-type(1) .edit-btn")
    .addEventListener("click", () => toggleEdit("account"));

  document
    .querySelector(".settingsContainer:nth-of-type(1) .save-btn")
    .addEventListener("click", () => saveChanges("account"));

  // Attach listener to existing "Change Password" button
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", showPasswordFields);
  }

  // Hide password fields initially
  document.getElementById("passwordFields").style.display = "none";

  fetchUserData();

  // Handle "Save Password" button click
  document.getElementById("savePasswordBtn").addEventListener("click", async () => {
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!newPassword || !confirmPassword) {
      alert("Please enter and confirm your new password.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        await updatePassword(user, newPassword);
        alert("Password changed successfully!");
        document.getElementById("passwordFields").style.display = "none";
        document.getElementById("changePasswordBtn").style.display = "block";
        document.getElementById("newPassword").value = "";
        document.getElementById("confirmPassword").value = "";
      } catch (error) {
        console.error("Error updating password:", error);
        alert("Failed to change password. You may need to log in again.");
      }
    } else {
      alert("No user is currently signed in.");
    }
  });

  // Add listener for "Cancel" button to hide password fields
  const cancelBtn = document.getElementById("cancelPasswordBtn");
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      document.getElementById("passwordFields").style.display = "none";
      document.getElementById("changePasswordBtn").style.display = "block";
      document.getElementById("newPassword").value = "";
      document.getElementById("confirmPassword").value = "";
    });
  }
});


// Toggle the signin password visibility
togglePasswordIcon.addEventListener('click', function () {
  const type = newPassword.type === 'password' ? 'text' : 'password';
  newPassword.type = type;

  // Toggle the icon class to change the eye icon
  if (newPassword.type === 'password') {
    togglePasswordIcon.classList.remove('fa-eye-slash');
    togglePasswordIcon.classList.add('fa-eye');
  } else {
    togglePasswordIcon.classList.remove('fa-eye');
    togglePasswordIcon.classList.add('fa-eye-slash');
  }
});

// Toggle the signup password visibility
toggleConfirmPasswordIcon.addEventListener('click', function () {
  const type = confirmPassword.type === 'password' ? 'text' : 'password';
  confirmPassword.type = type;

  // Toggle the icon class to change the eye icon
  if (confirmPassword.type === 'password') {
    toggleConfirmPasswordIcon.classList.remove('fa-eye-slash');
    toggleConfirmPasswordIcon.classList.add('fa-eye');
  } else {
    toggleConfirmPasswordIcon.classList.remove('fa-eye');
    toggleConfirmPasswordIcon.classList.add('fa-eye-slash');
  }
});

