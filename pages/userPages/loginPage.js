const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyD67uxAxE6kH-CsHtJoV3k0dnjO0FYa6X4",
    authDomain: "parksmartdemo-52898.firebaseapp.com",
    projectId: "parksmartdemo-52898",
    storageBucket: "parksmartdemo-52898.firebasestorage.app",
    messagingSenderId: "1021571240958",
    appId: "1:1021571240958:web:d623d7248462c3a68426af"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get form elements
const signUpForm = document.getElementById("signUpForm");
const signInForm = document.getElementById("signInForm");

if (signUpForm) {
    signUpForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = document.getElementById("signupEmail").value;
        const password = document.getElementById("signupPassword").value;

        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                alert("Account Created Successfully!");
                console.log("User Created:", userCredential.user);
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
