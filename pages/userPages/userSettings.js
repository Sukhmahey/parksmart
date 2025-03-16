import { db } from "../../js/firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";


async function fetchUserData() {

  const userId = localStorage.getItem("userId");
  console.log(userId);

  if (userId) {
    try {
      // Reference the Firestore document based on the userId
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);

      // Check if the document exists
      if (docSnap.exists()) {
        console.log("User Data:", docSnap.data());  // Log the user data
      } else {
        console.log("No such user found!");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  } else {
    console.log("No userId found in local storage.");
  }
}

// Call the function to fetch and log the user data
fetchUserData();









// function toggleEdit(section) {
//     let inputs;
//     if (section === 'account') {
//         inputs = document.querySelectorAll('.settingsContainer:nth-of-type(1) input');
//     } else {
//         inputs = document.querySelectorAll('.settingsContainer:nth-of-type(2) input');
//     }

//     inputs.forEach(input => input.removeAttribute('readonly'));

//     let editBtn = document.querySelector(`.${section === 'account' ? 'settingsContainer:nth-of-type(1)' : 'settingsContainer:nth-of-type(2)'} .edit-btn`);
//     let saveBtn = document.querySelector(`.${section === 'account' ? 'settingsContainer:nth-of-type(1)' : 'settingsContainer:nth-of-type(2)'} .save-btn`);

//     editBtn.style.display = 'none';
//     saveBtn.style.display = 'block';
// }

// function saveChanges(section) {
//     let inputs;
//     if (section === 'account') {
//         inputs = document.querySelectorAll('.settingsContainer:nth-of-type(1) input');
//     } else {
//         inputs = document.querySelectorAll('.settingsContainer:nth-of-type(2) input');
//     }

//     inputs.forEach(input => input.setAttribute('readonly', true));

//     let editBtn = document.querySelector(`.${section === 'account' ? 'settingsContainer:nth-of-type(1)' : 'settingsContainer:nth-of-type(2)'} .edit-btn`);
//     let saveBtn = document.querySelector(`.${section === 'account' ? 'settingsContainer:nth-of-type(1)' : 'settingsContainer:nth-of-type(2)'} .save-btn`);

//     editBtn.style.display = 'block';
//     saveBtn.style.display = 'none';

//     alert("Changes saved successfully!");
// }
