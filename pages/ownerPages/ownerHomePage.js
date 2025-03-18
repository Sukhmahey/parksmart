import { getParkingSpaces,deleteParkingSpace, getUserById } from "../../js/crud.js";

const listingarea = document.getElementById("listingarea");


const currentUser = localStorage.getItem("userId");



const userNm = await getUserById(currentUser);

const username = document.getElementById('username');
username.textContent = userNm.firstName;

// storing user name in local storage
localStorage.setItem("username", userNm.firstName);


async function populateListings() {
  try {
    // Get parking spaces
    listingarea.innerHTML = "";
    const parkingSpaces = await getParkingSpaces();
    
    
    parkingSpaces.forEach((space) => {
      // Create listing elements
      if(space.user_id == currentUser)
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
        // open html file for editing
        window.location.href = `edit-listing.html?id=${space.space_id}`;
      });

      //delete button
      const deleteOne = document.createElement("button");
      deleteOne.classList.add("deleteOne");
      deleteOne.innerHTML = "&#128465; Delete";
      listing.appendChild(deleteOne);

      deleteOne.addEventListener("click", () => {
        showDeleteModal(() => {
          deleteParkingSpace(space.space_id);
          populateListings();
        }, "Are you sure you want to delete this listing?");
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
  showDeleteModal(async () => {
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
  }, "Are you sure you want to delete all listings?");
}

document.querySelector('.removeAll').addEventListener('click', deleteAllParkingSpaces);



function showDeleteModal(confirmCallback, message) {
  let modal = document.getElementById("deleteModal");
  let overlay = document.getElementById("modalOverlay");

  // Create modal if not exists
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "deleteModal";
    modal.classList.add("modal");
    modal.innerHTML = `
      <div class="modal-content">
        <p id="modalMessage"></p>
        <button id="confirmDelete">Yes</button>
        <button id="cancelDelete">No</button>
      </div>`;
    document.body.appendChild(modal);
  }

  // Create overlay if not exists
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    overlay.classList.add("modal-overlay");
    document.body.appendChild(overlay);
  }

  document.getElementById("modalMessage").textContent = message;

  // Show modal and overlay
  modal.classList.add("show");
  overlay.classList.add("show");

  // Ensure previous event listeners are removed before adding new ones
  const confirmBtn = document.getElementById("confirmDelete");
  const cancelBtn = document.getElementById("cancelDelete");

  confirmBtn.replaceWith(confirmBtn.cloneNode(true)); // Remove old event listener
  cancelBtn.replaceWith(cancelBtn.cloneNode(true)); // Remove old event listener

  // Add event listeners to new elements
  document.getElementById("confirmDelete").addEventListener("click", () => {
    confirmCallback();
    closeModal();
  });

  document.getElementById("cancelDelete").addEventListener("click", closeModal);

  // Allow clicking outside the modal to close it
  overlay.onclick = closeModal;
}

// Function to close the modal
function closeModal() {
  document.getElementById("deleteModal")?.classList.remove("show");
  document.getElementById("modalOverlay")?.classList.remove("show");
}



// Initial call to populate listings
populateListings();