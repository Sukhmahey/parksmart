import { addParkingSpace, getUserById } from "../../js/crud.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
let longitudeValue;
let latitudeValue;
let ownerId = localStorage.getItem("userId");
let username = localStorage.getItem("username");
const prelabel = document.getElementById('pre-labels');

const supabaseUrl = "https://uilvkvvhtlcluutiflwk.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbHZrdnZodGxjbHV1dGlmbHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDA0MjIsImV4cCI6MjA1NzkxNjQyMn0.Ay2oFoNhYSzf6eChcFfI13ChJNjtDiFMlTViUfROl0o";
const supabase = createClient(supabaseUrl, supabaseKey);

let uploadedImageUrl = null;

// Camera handler functions

console.log("uploadedImageUrl", uploadedImageUrl);

const fileInput = document.getElementById("file-input");
const uploadBtn = document.getElementById("upload-btn");
const fileName = document.getElementById("file-name");

fileInput.addEventListener("change", function (e) {
  preview.src = '';
  preview.style.display = 'none';
  if (this.files && this.files.length > 0) {
    fileName.textContent = this.files[0].name;
    uploadBtn.disabled = false;
  } else {
    fileName.textContent = "No file chosen";
    uploadBtn.disabled = true;
  }
});

function sanitizeFileName(fileName) {
  return fileName
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^\w\-\.]+/g, "") // Remove any non-alphanumeric characters except for dots and hyphens
    .toLowerCase(); // Optionally, convert to lowercase
}

async function uploadImage() {
  let file;
  const preview = document.getElementById("preview");

  // Check for camera image first
  if (preview.src && preview.src.startsWith('data:')) {
    file = dataURLtoFile(preview.src, `camera_${Date.now()}.jpg`);
  } else {
    file = fileInput.files[0];
  }

  if (!file) {
    showModal("Please select an image first.",true);
    return;
  }

  // Rest of your existing upload logic remains the same
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabase.storage
    .from("images")
    .upload(sanitizeFileName(fileName), file, {});

  if (error) {
    console.error(error);
    showModal("Error uploading file",true);
  } else {
    showModal("File uploaded successfully",true);
    // displayImage(data?.path);
    // Reset camera preview
    preview.src = '';
    preview.style.display = 'none';
  }

  if (data?.path) {
    showModal("File uploaded successfully", true);
    displayImage(data.path);
    // Reset both camera preview and file input
    preview.src = '';
    preview.style.display = 'none';
    fileInput.value = '';
    fileName.textContent = "No file chosen";
  }
}



async function displayImage(filePath) {
  const imageElementContainer = document.getElementById("imgContainer");
  imageElementContainer.innerHTML = '';

  console.log("here", filePath);
  const data = await supabase.storage.from("images").getPublicUrl(filePath); // Get the public URL of the file

  if (data) {
    console.log("herererererer", data);
    uploadedImageUrl = data.data.publicUrl;
  }

  console.log("Data", data, data.data.publicUrl);
  if (data?.error) {
    console.log("error here", error);
    console.error(error);
    return;
  }

  
  // const imageElementContainer = document.getElementById("imgContainer");
  const imageElement = document.createElement("img");

  if (data?.data?.publicUrl) {
    imageElementContainer.style.display = "flex";
    console.log("imageElement", imageElement);
    imageElement.src = data?.data?.publicUrl || "";
    imageElementContainer.appendChild(imageElement);
  }

  
  imageElement.src = data?.data?.publicUrl || "";
  imageElementContainer.appendChild(imageElement);

}

window.uploadImage = uploadImage;

const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function convertTo12HourFormat(time24) {
  const [hours, minutes] = time24.split(":");
  const parsedHours = parseInt(hours);
  const ampm = parsedHours >= 12 ? "PM" : "AM";
  const hours12 = parsedHours % 12 || 12;

  return `${hours12}:${minutes}${ampm}`;
}
let availableNow;
document
  .getElementById("availabilityToggle")
  .addEventListener("change", function () {
    const statusText = document.getElementById("availabilityStatus");
    const isAvailable = this.checked;
    availableNow = isAvailable;
    statusText.textContent = isAvailable ? "Available" : "Not Available";
    console.log("Availability:", isAvailable);
    isAvailable ? calender() : (calendercontainer.innerHTML = "");
  });

const calendercontainer = document.getElementById("availabilityContainer");
function calender() {
  daysOfWeek.forEach((day) => {
    const div = document.createElement("div");
    div.className = "day-row";
    div.innerHTML = `
            <label class="day-checkbox">
                <input type="checkbox" class="day-checkbox" data-day="${day}">
                ${day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
            <div class="time-inputs">
                <input type="time" data-day="${day}-start" min="00:00" max="05:00" step="3600">
                <span>to</span>
                <input type="time" data-day="${day}-end" min="00:00" max="05:00" step="3600">
            </div>
        `;
    calendercontainer.appendChild(div);
  });
}

// Validation function
function validateAvailability() {
  const errorElement = document.getElementById("availabilityError");
  errorElement.style.display = "none";
  let isValid = true;

  const availability = {};

  document
    .querySelectorAll('.day-checkbox input[type="checkbox"]')
    .forEach((checkbox) => {
      const day = checkbox.dataset.day;

      const startInput = document.querySelector(`[data-day="${day}-start"]`);
      const endInput = document.querySelector(`[data-day="${day}-end"]`);

      if (checkbox.checked) {
        const startTime = startInput.value;
        const endTime = endInput.value;

        // Validate required times
        if (!startTime || !endTime) {
          errorElement.textContent = `Please set times for ${day}`;
          errorElement.style.display = "block";
          isValid = false;
        }

        // Validate time order
        if (startTime >= endTime) {
          errorElement.textContent = `End time must be after start time on ${day}`;
          errorElement.style.display = "block";
          isValid = false;
        }

        // Convert to AM/PM format
        if (isValid) {
          availability[day] = `${convertTo12HourFormat(
            startTime
          )} - ${convertTo12HourFormat(endTime)}`;
        }
      }
    });

  return isValid ? availability : false;
}

document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("autocomplete");
  const suggestionsList = document.getElementById("suggestions");
  const apiKey = "d79219fb6dcc45159636535b526e950f";
  inputField.addEventListener("input", async () => {
    const query = inputField.value.trim();
    if (query.length < 3) {
      suggestionsList.innerHTML = "";
      suggestionsList.style.display = "none";
      return;
    }

    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          query
        )}&apiKey=${apiKey}`
      );
      const data = await response.json();
      displaySuggestions(data);
    } catch (error) {
      console.error("Error fetching autocomplete results:", error);
    }
  });

  function displaySuggestions(data) {
    suggestionsList.innerHTML = ""; // Clear old suggestions
    console.log("Autocomplete data:", data);

    if (data.features && data.features.length > 0) {
      suggestionsList.style.display = "block"; // Show suggestions

      data.features.forEach((feature) => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.textContent = feature.properties.formatted;
        suggestion.addEventListener("click", () => {
          inputField.value = feature.properties.formatted;
          longitudeValue = feature.properties.lon;
          latitudeValue = feature.properties.lat;
          suggestionsList.innerHTML = ""; // Hide suggestions
          suggestionsList.style.display = "none";
        });
        suggestionsList.appendChild(suggestion);
      });
    } else {
      suggestionsList.style.display = "none"; // Hide if no results
    }
  }

  // Close suggestions when clicking outside
  document.addEventListener("click", (event) => {
    if (
      !inputField.contains(event.target) &&
      !suggestionsList.contains(event.target)
    ) {
      suggestionsList.style.display = "none";
    }
  });
});

// Image Handler

const handleImage = async () => {
  const preview = document.getElementById("preview");
  if (!preview?.src?.startsWith("data:image")) return null;

  return preview?.src;
};



const handleFormSubmission = async (e) => {
  e.preventDefault();
  console.log("Values");
  console.log(longitudeValue);
  console.log(latitudeValue);
  // Validate availability
  const availability = validateAvailability();
  if (!availability) return;

  const formData = {
    name: document.getElementById("name").value.trim(),
    location: document.getElementById("autocomplete").value.trim(),
    price: document.getElementById("price").value.trim(),
    description: document.getElementById("description").value.trim(),
    image: await handleImage(),
    // image: "https://loremflickr.com/640/480",
    longitude: longitudeValue,
    latitude: latitudeValue,
    isAvailable: availableNow,
    availability: availability,

    // features: features
  };

  if (uploadedImageUrl) {
    formData.imgURL = uploadedImageUrl;
  }
  if (!formData.name || !formData.location || !formData.price) {
    // Validation
    return showModal("Please fill in all required fields", true);
  }
  if (isNaN(formData.price)) {
    return showModal("Please enter a valid price", true);
  }

  try {
    // addParkingSpace function from crud.
    await addParkingSpace(
      ownerId,
      formData.name,
      username,
      formData.location,
      formData.description,
      formData.imgURL,
      parseFloat(formData.price),
      formData.image || "https://loremflickr.com/640/480",
      formData.longitude,
      formData.latitude,
      formData.isAvailable,
      formData.availability
      // formData.features
    );

    // Reset form
    document.getElementById("name").value = "";
    document.getElementById("autocomplete").value = "";
    document.getElementById("price").value = "";
    document.getElementById("description").value = "";
    // document.getElementById("preview")?.style?.display = "none";
    showModal("Parking space added successfully!");
  } catch (error) {
    console.error("Submission error:", error);
    showModal(`Error saving listing: ${error.message}`, true);
  }
};

// Event Listeners
// if (document.getElementById("fileInput")) {
//   document.getElementById("fileInput").addEventListener("change", (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       document.getElementById("preview").src = e.target.result;
//       document.getElementById("preview").style.display = "block";
//     };
//     reader.readAsDataURL(file);
//   });
// }

// Corrected ID from "fileInput" to "file-input"
if (document.getElementById("file-input")) {
  document.getElementById("file-input").addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Clear camera preview when a file is selected
    const preview = document.getElementById("preview");
    preview.src = '';
    preview.style.display = 'none';

    const reader = new FileReader();
    reader.onload = (e) => {
      document.getElementById("preview").src = e.target.result;
      document.getElementById("preview").style.display = "block";
    };
    reader.readAsDataURL(file);
  });
}



document
  .getElementById("cameraButton")
  ?.addEventListener("click", handleCameraCapture);
document
  .querySelector(".update-btn")
  ?.addEventListener("click", handleFormSubmission);

function showModal(message, isError = false) {
  let modal = document.getElementById("messageModal");
  let overlay = document.querySelector(".modal-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    document.body.appendChild(overlay);
  }

  if (!modal) {
    modal = document.createElement("div");
    modal.id = "messageModal";
    modal.className = "modal";
    modal.innerHTML = `
            <div class="modal-content">
                <p id="modalText"></p>
                <button id="modalButton"></button>
            </div>
        `;
    document.body.appendChild(modal);
  }

  const modalText = modal.querySelector("#modalText");
  const modalButton = modal.querySelector("#modalButton");

  modalText.textContent = message;
  modal.classList.add("show");
  overlay.classList.add("show");

  if (isError) {
    modal.classList.add("error");
    modalButton.textContent = "Close";
    modalButton.onclick = () => {
      overlay.classList.remove("show");
      modal.classList.remove("show");
    };
  } else {
    modal.classList.remove("error");
    modalButton.textContent = "Go to Homepage";
    modalButton.onclick = () => {
      overlay.classList.remove("show");
      window.location.href = "ownerHomePage.html";
    };
  }
}

const modalStyle = document.createElement("style");
modalStyle.innerHTML = `
    .modal {
        display: none;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.3);
        z-index: 1000;
    }
    .modal.show { display: block; }
    .modal-content { text-align: center; }
    .modal.error { background: #f8d7da; }
    #modalButton { margin-top: 10px; padding: 8px 16px; cursor: pointer; }
`;
document.head.appendChild(modalStyle);

// Camera handler functions
function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

async function handleCameraCapture() {
  const video = document.getElementById("cameraFeed");
  const canvas = document.getElementById("canvas");
  const preview = document.getElementById("preview");
  prelabel.style.display = 'none';

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: "environment" } 
    });
    
    video.srcObject = stream;
    video.style.display = 'block';
    await video.play();

    // Create capture controls
    const controls = document.createElement('div');
    controls.className = 'camera-controls';
    controls.innerHTML = `
      <label class="capture-btn"><svg xmlns="http://www.w3.org/2000/svg" class="icons-media" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m12,0C5.373,0,0,5.373,0,12s5.373,12,12,12,12-5.373,12-12S18.627,0,12,0Zm1.409,2.1c2.683.38,5.027,1.828,6.586,3.9h-8.962s2.377-3.9,2.377-3.9Zm.783,5.899l2.433,4.005-2.436,3.996h-4.445l-2.308-4.101,2.378-3.901h4.378Zm-3.088-5.957l-4.792,7.861-2.242-3.984c1.658-2.157,4.175-3.621,7.034-3.876ZM2.836,16c-.537-1.226-.836-2.578-.836-4,0-1.464.316-2.856.885-4.111l4.565,8.111H2.836Zm7.755,5.9c-2.683-.38-5.027-1.829-6.586-3.9h8.964l-2.378,3.9Zm2.306.059l4.896-8.031,2.35,3.87c-1.651,2.313-4.262,3.895-7.246,4.162Zm3.634-13.96h4.633c.537,1.226.836,2.579.836,4.001,0,1.337-.264,2.613-.743,3.78l-4.726-7.78Z"/>
</svg><br>Capture</label>
      <label class="close-btn"><svg xmlns="http://www.w3.org/2000/svg" class="icons-media-stop" id="Layer_1" data-name="Layer 1" viewBox="0 0 24 24">
  <path d="m23.707,22.293l-1.536-1.536c.538-.813.829-1.771.829-2.757v-8c0-2.757-2.243-5-5-5H6.414L1.707.293C1.316-.098.684-.098.293.293S-.098,1.316.293,1.707l22,22c.195.195.451.293.707.293s.512-.098.707-.293c.391-.391.391-1.023,0-1.414Zm-6.903-6.903l-6.194-6.194c.45-.13.915-.196,1.39-.196,2.757,0,5,2.243,5,5,0,.474-.066.94-.196,1.39Zm-.185-12.39H7.381l.471-.69c.559-.82,1.485-1.31,2.479-1.31h3.34c.993,0,1.92.489,2.479,1.31l.471.69Zm-4.619,14c-1.654,0-3-1.346-3-3,0-.284.041-.559.115-.82l3.698,3.707c-.259.073-.531.113-.812.113Zm5.208,4.294c.285.286.37.716.216,1.089-.155.374-.52.617-.924.617H6c-2.757,0-5-2.243-5-5v-8c0-.881.231-1.745.67-2.502.156-.269.428-.449.736-.489.304-.042.617.064.837.285l4.345,4.356c-.375.701-.588,1.501-.588,2.35,0,2.757,2.243,5,5,5,.845,0,1.641-.211,2.339-.582l2.869,2.876Z"/>
</svg><br>Stop Camera</label>
    `;

    // controls.innerHTML = `
    //   <button type="button" class="capture-btn"><img src="Assets/aperture.svg" class="icons-media"></button>
    //   <button type="button" class="close-btn"><img src="Assets/camera-slash.svg" class="icons-media"></button>
    // `;

    // Add controls to media buttons container
    document.querySelector('.media-buttons').appendChild(controls);

    // Capture handler
    controls.querySelector('.capture-btn').addEventListener('click', () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      preview.src = canvas.toDataURL('image/jpeg');
      preview.style.display = 'block';
      video.style.display = 'none';
      stream.getTracks().forEach(track => track.stop());
      controls.remove();
      prelabel.style.display = 'flex';
      uploadBtn.disabled = false;

      fileInput.value = '';
    fileName.textContent = "No file chosen";
    uploadBtn.disabled = false;
    });

    // Close handler
    controls.querySelector('.close-btn').addEventListener('click', () => {
      video.style.display = 'none';
      prelabel.style.display = 'flex';
      stream.getTracks().forEach(track => track.stop());
      controls.remove();
    });

  } catch (error) {
    showModal(`Camera error: ${error.message}`,true);
  }
}

// Add event listener for camera button
document.getElementById('cameraButton').addEventListener('click', handleCameraCapture);