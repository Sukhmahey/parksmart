import { signUp, signIn, logout } from "./auth.js";
import { addUser, getUsers, addParkingSpace } from "./crud.js";

// Handling Sign Up Form
const signUpForm = document.getElementById("signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    // Get the input values from the form
    const firstName = document.getElementById("signupFirstName").value;
    const lastName = document.getElementById("signupLastName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const phoneNumber = document.getElementById("signupPhoneNumber").value; // Add this field in your form
    const isSpaceOwner = document.getElementById("isSpaceOwner").checked;
    const role = isSpaceOwner ? "spaceOwner" : "user";

    try {
      // Sign up the user
      const user = await signUp(firstName, lastName, email, password, role);
      localStorage.setItem("userId", user.uid);
      // Add user information to Firestore
      await addUser(user.uid, firstName, lastName, email, phoneNumber, password, role);

      // After successful sign up, log the user in
      await signIn(email, password);

      // Redirect to homepage after successful sign up and login
      window.location.href = "../pages/userPages/homepage.html";
    } catch (error) {
      alert(error.message);
    }
  });
}



// Handling Sign In Form
const signInForm = document.getElementById("signInForm");
if (signInForm) {
  signInForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("signinEmail").value;
    const password = document.getElementById("signinPassword").value;

    try {
      await signIn(email, password).then((data) => {
        localStorage.setItem("userId", data?.uid);
        window.location.href = "../pages/userPages/homepage.html";
      });
    } catch (error) {
      alert(error.message);
    }
  });
}

// Logout Functionality
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await logout();
    alert("Logged out successfully!");
    window.location.href = "../pages/userPages/loginPage.html";
  });
}
