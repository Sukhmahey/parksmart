import { signUp, signIn, logout } from "./auth.js";
import { addUser, getUsers, addParkingSpace } from "./crud.js";

// Handling Sign Up Form
const signUpForm = document.getElementById("signUpForm");
if (signUpForm) {
  signUpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const isSpaceOwner = document.getElementById("isSpaceOwner").checked;
    const role = isSpaceOwner ? "spaceOwner" : "user";

    try {
      const user = await signUp(name, email, password, role);
      await addUser(name, email, role);
      alert("Account Created Successfully!");
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
      await signIn(email, password);
      alert("Login Successful!");
      window.location.href = "../pages/userPages/homepage.html";
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

// Example: Fetching Users
document
  .getElementById("fetchUsersBtn")
  ?.addEventListener("click", async () => {
    const users = await getUsers();
    console.log("Users List:", users);
  });
