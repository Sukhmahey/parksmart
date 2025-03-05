import { getParkingSpaces,deleteParkingSpace } from "../../js/cruds.js";

const listingarea = document.getElementById("listingarea");

// const currentUser = JSON.parse(localStorage.getItem("currentUser"));
const currentUser = 4;



async function populateListings() {
  try {
    // Get parking spaces
    listingarea.innerHTML = "";
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
        // open html file for editing
        window.location.href = `edit-listing.html?id=${space.space_id}`;
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