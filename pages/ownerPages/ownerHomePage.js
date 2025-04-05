import {
  getParkingSpaces,
  deleteParkingSpace,
  getUserById,
} from "../../js/crud.js";

const listingarea = document.getElementById("listingarea");
const noListings = document.getElementById("noListings");
const currentUser = localStorage.getItem("userId");
const userNm = await getUserById(currentUser);
const username = document.getElementById("username");
const smileys = [
  "😃",
  "😁",
  "😇",
  "😊",
  "😆",
  "😄",
  "😎",
  "🤩",
  "🤗",
  "🥳",
  "🥸",
  "🤠",
];
const randomSmile = smileys[Math.floor(Math.random() * smileys.length)];
username.textContent = userNm?.firstName || "" + " " + randomSmile;

document.getElementById("logo")?.addEventListener("click", function () {
  window.location.href = "/pages/userPages/homepage.html";
});

localStorage.setItem("username", userNm?.firstName || "");

async function populateListings() {
  try {
    listingarea.innerHTML = "";
    const parkingSpaces = await getParkingSpaces();
    let hasListings = false;

    parkingSpaces.forEach((space) => {
      if (space.user_id == currentUser) {
        hasListings = true;
        const listing = document.createElement("div");
        listing.classList.add("listing");
        listingarea.appendChild(listing);

        const image = document.createElement("div");
        image.classList.add("image");
        image.innerHTML = `<img src="${space.imgURL}" alt="Parking spot image">`;
        listing.appendChild(image);

        const details = document.createElement("div");
        details.classList.add("details");
        listing.appendChild(details);

        const name = document.createElement("p");
        name.textContent = space.title;
        details.appendChild(name);

        const location = document.createElement("p");
        location.textContent = "📍 " + space.address;
        details.appendChild(location);

        const price = document.createElement("p");
        price.textContent = `💰 Price: $${space.price_per_hour}/hour`;
        details.appendChild(price);

        const availability = document.createElement("div");
        availability.classList.add("availability");
        let availabilityHTML = "<strong>Availability:</strong>";
        availabilityHTML += "<div class='availability-days'>";
        for (const [day, time] of Object.entries(space.availability || {})) {
          availabilityHTML += `
    <div class="day-time">
      <span class="day">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
      <span class="time">${time}</span>
    </div>`;
        }
        availabilityHTML += "</div>";
        availability.innerHTML = availabilityHTML;
        details.appendChild(availability);

        const edit = document.createElement("button");
        edit.classList.add("edit");
        edit.innerHTML = "✏️ Edit";
        listing.appendChild(edit);
        edit.addEventListener("click", () => {
          window.location.href = `edit-listing.html?id=${space.space_id}`;
        });

        const deleteOne = document.createElement("button");
        deleteOne.classList.add("deleteOne");
        deleteOne.innerHTML = "🗑️ Delete";
        listing.appendChild(deleteOne);
        deleteOne.addEventListener("click", () => {
          showDeleteModal(() => {
            deleteParkingSpace(space.space_id);
            populateListings();
          }, "Are you sure you want to delete this listing?");
        });
      }
    });

    noListings.style.display = hasListings ? "none" : "block";
  } catch (error) {
    console.error("Error loading parking spaces:", error);
  }
}

let deleteAction = null;

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
  deleteAction = action;
  modal.classList.add("show");
  overlay.classList.add("show");
}

document.body.addEventListener("click", (event) => {
  if (event.target.id === "confirmDelete" && deleteAction) {
    deleteAction();
    closeModal();
  }
});

document.body.addEventListener("click", (event) => {
  if (event.target.id === "cancelDelete") {
    closeModal();
  }
});

function closeModal() {
  document.getElementById("deleteModal")?.classList.remove("show");
  document.getElementById("modalOverlay")?.classList.remove("show");
}

populateListings();
