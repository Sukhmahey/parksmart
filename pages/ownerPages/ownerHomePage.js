import { getParkingSpaces,deleteParkingSpace } from "../../crud.js";

const listingarea = document.getElementById("listingarea");
// const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const currentUser = 4;

//  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
//  import { getFirestore, collection, addDoc,getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";
//  import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-analytics.js";
 // TODO: Add SDKs for Firebase products that you want to use
 // https://firebase.google.com/docs/web/setup#available-libraries


 
//  const firebaseConfig = {
//    apiKey: "AIzaSyCLkQlLAXrx78VjhP3S6w6zLhCPmXNyMtQ",
//    authDomain: "parksmartowner.firebaseapp.com",
//    projectId: "parksmartowner",
//    storageBucket: "parksmartowner.firebasestorage.app",
//    messagingSenderId: "571166769031",
//    appId: "1:571166769031:web:394821c17335e9afca1d22",
//    measurementId: "G-2WDLX03JLW"
//  };

 // Initialize Firebase
//  const app = initializeApp(firebaseConfig);
//  const analytics = getAnalytics(app);
//  const db = getFirestore(app);

//  async function getAllListings() {
//     const querySnapshot = await getDocs(collection(db, "OwnerListings"));
//     querySnapshot.forEach((doc) => {
//       console.log(doc.id, " => ", doc.data());

//     //   <!-- <div class="listing">
//     //                 <div class="image">Parking spot image</div>
//     //                 <div class="details">
//     //                     <p>Parking spot name</p>
//     //                     <p>Parking spot location</p>
//     //                     <p>Parking Spot Price</p>
//     //                 </div>
//     //                 <button class="edit">&#9998; Edit</button>
//     //             </div>

//     const listing = document.createElement("div");
//     listing.classList.add("listing");
//     listingarea.appendChild(listing);
//     const image = document.createElement("div");
//     image.classList.add("image");
//     image.innerHTML = `<img src="${doc.data().image}" alt="Parking spot image">`;
//     listing.appendChild(image);
//     const details = document.createElement("div");
//     details.classList.add("details");
//     listing.appendChild(details);
//     const name = document.createElement("p");
//     name.textContent = `${doc.data().Listing_name}`;
//     details.appendChild(name);
//     const location = document.createElement("p");
//     location.textContent = `${doc.data().Street_name}`;
//     details.appendChild(location);
//     const price = document.createElement("p");
//     price.textContent = ` Price: $${doc.data().price}`;
//     details.appendChild(price);
//     const edit = document.createElement("button");
//     edit.classList.add("edit");
//     edit.innerHTML = "&#9998; Edit";
//     listing.appendChild(edit);
//     edit.addEventListener("click", () => {
//         console.log("Edit button clicked");
//         });
    
    


//     });
//   }

//   getAllListings();

async function populateListings() {
  try {
    // Get parking spaces
    const parkingSpaces = await getParkingSpaces();
    
    
    parkingSpaces.forEach((space) => {
      // Create listing elements
      if(space.owner_id == currentUser)
      {
        const listing = document.createElement("div");
      listing.classList.add("listing");
      listingarea.appendChild(listing);

      // Image section
      const image = document.createElement("div");
      image.classList.add("image");
      image.innerHTML = `<img src="${space.image}" alt="Parking spot image">`;
      listing.appendChild(image);

      // Details section
      const details = document.createElement("div");
      details.classList.add("details");
      listing.appendChild(details);

      // Title
      const name = document.createElement("p");
      name.textContent = space.title;
      details.appendChild(name);

      // Address
      const location = document.createElement("p");
      location.textContent = space.address;
      details.appendChild(location);

      // Price
      const price = document.createElement("p");
      price.textContent = `Price: $${space.price_per_hour}/hour`;
      details.appendChild(price);

      // Edit button
      const edit = document.createElement("button");
      edit.classList.add("edit");
      edit.innerHTML = "&#9998; Edit";
      listing.appendChild(edit);

      edit.addEventListener("click", () => {
        console.log("Edit button clicked for:", space.space_id);
      });

      //delete button
      const deleteOne = document.createElement("button");
      deleteOne.classList.add("deleteOne");
      deleteOne.innerHTML = "&#128465; Delete";
      listing.appendChild(deleteOne);

      deleteOne.addEventListener("click", () => {
        console.log("delete button clicked for:", space.space_id);
        deleteParkingSpace(space.space_id);
        populateListings();

      });
      }

      
      
      
      
    });
  } catch (error) {
    console.error("Error loading parking spaces:", error);
  }

  
}

// delete all parking space

// Function to delete all parking spaces
async function deleteAllParkingSpaces() {
  try {
    const parkingSpaces = await getParkingSpaces();
    for (const space of parkingSpaces) {
      if (space.owner_id == currentUser) {
        await deleteParkingSpace(space.space_id);
      }
    }
    populateListings();
  } catch (error) {
    console.error("Error deleting all parking spaces:", error);
  }
}


document.querySelector('.removeAll').addEventListener('click', deleteAllParkingSpaces);



// Initial call to populate listings
populateListings();