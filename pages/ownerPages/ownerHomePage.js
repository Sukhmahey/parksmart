import {
  getParkingSpaces,
  deleteParkingSpace,
  getUserById,
} from "../../js/crud.js";

const listingarea = document.getElementById("listingarea");

const currentUser = localStorage.getItem("userId");

const userNm = await getUserById(currentUser);

const username = document.getElementById("username");
username.textContent = userNm?.firstName || "";

// storing user name in local storage
localStorage.setItem("username", userNm?.firstName | "");

async function populateListings() {
  try {
    // Get parking spaces
    listingarea.innerHTML = "";
    const parkingSpaces = await getParkingSpaces();

    parkingSpaces.forEach((space) => {
      // Create listing elements
      if (space.user_id == currentUser) {
        const listing = document.createElement("div");
        listing.classList.add("listing");
        listingarea.appendChild(listing);

        // Image section
        const image = document.createElement("div");
        image.classList.add("image");
        image.innerHTML = `<img src="${space.imgURL}" alt="Parking spot image">`;
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

document
  .querySelector(".removeAll")
  .addEventListener("click", deleteAllParkingSpaces);

let deleteAction = null; // Stores the function to execute on confirmation

function showDeleteModal(action, message) {
  let modal = document.getElementById("deleteModal");
  let overlay = document.getElementById("modalOverlay");

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

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "modalOverlay";
    overlay.classList.add("modal-overlay");
    document.body.appendChild(overlay);
  }

  document.getElementById("modalMessage").textContent = message;

  deleteAction = action; // Store the function to call when confirmed

  modal.classList.add("show");
  overlay.classList.add("show");
}

// Set a single event listener for the "Yes" button
document.body.addEventListener("click", (event) => {
  if (event.target.id === "confirmDelete" && deleteAction) {
    deleteAction(); // Execute the stored function
    closeModal();
  }
});

// Set a single event listener for the "No" button
document.body.addEventListener("click", (event) => {
  if (event.target.id === "cancelDelete") {
    closeModal();
  }
});

// Close modal function
function closeModal() {
  document.getElementById("deleteModal")?.classList.remove("show");
  document.getElementById("modalOverlay")?.classList.remove("show");
}

// Initial call to populate listings
populateListings();
