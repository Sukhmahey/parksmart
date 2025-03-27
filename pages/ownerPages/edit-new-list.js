import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const supabaseUrl = "https://uilvkvvhtlcluutiflwk.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpbHZrdnZodGxjbHV1dGlmbHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIzNDA0MjIsImV4cCI6MjA1NzkxNjQyMn0.Ay2oFoNhYSzf6eChcFfI13ChJNjtDiFMlTViUfROl0o";
const supabase = createClient(supabaseUrl, supabaseKey);

const prelabel = document.getElementById('pre-labels');

let uploadedImageUrl = null; // Store the uploaded image URL from Supabase
import { fetchListingData, updateListing } from "../../js/crud.js";
const daysOfWeek = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
let longitudeValue;
let latitudeValue;
let AddressChanged;

let dataFetched = {};

function getListingIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  console.log(params.id);
  return params.get("id");
}

async function populateForm(listingId) {
  if (!listingId) return;

  try {
    const data = await fetchListingData(listingId);
    dataFetched = data;
    currentListingId = listingId;
    existingImageUrl = data.imgURL || "";
    // Existing image handling
    // if (data.image) {
    //   const preview = document.getElementById("preview");
    //   preview.src = data.image;
    //   preview.style.display = "block"; // Add this line
    // }
    

    // Basic fields
    document.getElementById("name").value = data.title || "";
    document.getElementById("autocomplete").value = data.address || "";
    document.getElementById("description").value = data.description || "";

    if (data?.imgURL && data.imgURL != "") {
      const picEle = document.getElementById("parkingSpotImage");
      const imageElement = document.createElement("img");
      imageElement.className = "img-existing-one";
      const preview = document.getElementById("preview");
    preview.src = data.imgURL;
    // preview.style.display = "block";

      console.log("imageElement", imageElement);
      imageElement.src = data.imgURL || "";
      picEle.appendChild(imageElement);
      picEle.style.display = "block";
    }

    document.getElementById("price").value = data.price_per_hour || "";
    document.getElementById("preview").src = existingImageUrl;

    // Handle availability toggle
    const availabilityToggle = document.getElementById("availabilityToggle");
    availabilityToggle.checked = data.isAvailable;
    document.getElementById("availabilityStatus").textContent = data.isAvailable
      ? "Available"
      : "Not Available";

    // Generate calendar only if available
    const availabilityContainer = document.getElementById(
      "availabilityContainer"
    );
    if (data.isAvailable) {
      generateCalendar();

      // Populate after short delay to ensure DOM exists
      setTimeout(() => {
        if (data.availability) {
          Object.entries(data.availability).forEach(([day, timeRange]) => {
            const [start12h, end12h] = timeRange.split(/\s*-\s*/);
            const start24h = convertTo24HourFormat(start12h);
            const end24h = convertTo24HourFormat(end12h);

            const checkbox = document.querySelector(`[data-day="${day}"]`);
            const startInput = document.querySelector(
              `[data-day="${day}-start"]`
            );
            const endInput = document.querySelector(`[data-day="${day}-end"]`);

            if (checkbox && startInput && endInput) {
              checkbox.checked = true;
              startInput.value = start24h;
              endInput.value = end24h;
            }
          });
        }
      }, 50);
    } else {
      availabilityContainer.innerHTML = "";
    }
  } catch (error) {
    console.error("Error populating form:", error);
  }
}


async function handleFormSubmission(e) {
    e.preventDefault();
    if (!validateForm()) return;
  
    const submitBtn = document.querySelector(".update-btn");
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";
  
    try {
      const isAvailable = document.getElementById("availabilityToggle").checked;
      let availability = isAvailable ? getAvailabilityData() : null;
      if (isAvailable && !availability) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Update Listing";
        return;
      }

      // Use existing coordinates if address wasn't changed
      const finalLongitude = AddressChanged ? longitudeValue : dataFetched.longitude;
      const finalLatitude = AddressChanged ? latitudeValue : dataFetched.latitude;
  
      // Use the uploadedImageUrl if available
      const imageUrl = uploadedImageUrl || dataFetched.imgURL;
  
      const formData = {
        title: document.getElementById("name").value.trim(),
        address: document.getElementById("autocomplete").value.trim(),
        description: document.getElementById("description").value.trim(),
        price_per_hour: parseFloat(document.getElementById("price").value.trim()),
        isAvailable: isAvailable,
        availability: availability,
        imgURL: imageUrl,
        longitude: finalLongitude,
        latitude: finalLatitude,
      };
  
      await updateListing(currentListingId, formData);
      showModal("Listing updated successfully!");
    } catch (error) {
      console.error("Error updating listing:", error);
      showModal(`Error updating listing: ${error.message}`, true);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Update Listing";
    }
}


function convertTo12HourFormat(time24) {
  let [hours, minutes] = time24.split(":");
  hours = parseInt(hours);

  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 to 12 for AM

  return `${hours}:${minutes} ${period}`;
}

function getAvailabilityData() {
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

        if (!startTime || !endTime) {
          errorElement.textContent = `Please set both start and end times for ${day}.`;
          errorElement.style.display = "block";
          isValid = false;
        } else if (startTime >= endTime) {
          errorElement.textContent = `End time must be after start time on ${day}.`;
          errorElement.style.display = "block";
          isValid = false;
        } else {
          availability[day] = `${convertTo12HourFormat(
            startTime
          )} - ${convertTo12HourFormat(endTime)}`;
        }
      }
    });

  return isValid ? availability : false;
}

function validateForm() {
  const requiredFields = [
    document.getElementById("name")?.value.trim(),
    document.getElementById("autocomplete")?.value.trim(),
    document.getElementById("price")?.value.trim(),
  ];

  if (requiredFields.some((field) => !field)) {
    showModal("Please fill all required fields", true);

    return false;
  }
  const isAvailable = document.getElementById("availabilityToggle").checked;
  if (isAvailable && !getAvailabilityData()) {
    return false;
  }

  return true;
}

function initializeGeoapify() {
  const inputField = document.getElementById("autocomplete");
  const suggestionsList = document.getElementById("suggestions");
  const apiKey = "d79219fb6dcc45159636535b526e950f";

  if (!inputField) return;

  inputField.addEventListener("input", async () => {
    AddressChanged = true;
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
    suggestionsList.innerHTML = "";

    if (data.features && data.features.length > 0) {
      suggestionsList.style.display = "block";

      data.features.forEach((feature) => {
        const suggestion = document.createElement("div");
        suggestion.classList.add("suggestion-item");
        suggestion.textContent = feature.properties.formatted;
        suggestion.addEventListener("click", () => {
          inputField.value = feature.properties.formatted;
          suggestionsList.innerHTML = "";
          suggestionsList.style.display = "none";

          longitudeValue = feature.properties.lon;
          latitudeValue = feature.properties.lat;
        });
        suggestionsList.appendChild(suggestion);
      });
    } else {
      suggestionsList.style.display = "none";
    }
  }

  document.addEventListener("click", (event) => {
    if (
      !inputField.contains(event.target) &&
      !suggestionsList.contains(event.target)
    ) {
      suggestionsList.style.display = "none";
    }
  });
}

let existingImageUrl = "";
let currentListingId = getListingIdFromUrl();
// console.log(currentListingId);

let mediaStream = null;

// async function handleCameraCapture() {
//   try {
//     // Clear previous preview
//     const preview = document.getElementById("preview");
//     preview.style.display = "none";

//     // Stop existing stream
//     if (mediaStream) {
//       mediaStream.getTracks().forEach((track) => track.stop());
//     }

//     // Create camera controls
//     const controls = document.createElement("div");
//     controls.className = "camera-controls";
//     controls.innerHTML = `
//             <button type="button" id="captureBtn">Capture</button>
//             <button type="button" id="stopBtn">Stop Camera</button>
//         `;
//     document.querySelector(".media-buttons").appendChild(controls);

//     // Get camera access
//     mediaStream = await navigator.mediaDevices.getUserMedia({
//       video: { facingMode: "environment" },
//     });

//     // Show video feed
//     const video = document.getElementById("cameraFeed");
//     video.style.display = "block";
//     video.srcObject = mediaStream;

//     // Play video feed
//     try {
//       await video.play();
//     } catch (err) {
//       console.log("Video play error:", err);
//     }

//     // Capture handler
//     document.getElementById("captureBtn").onclick = () => {
//       const canvas = document.getElementById("canvas");
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
//       canvas.getContext("2d").drawImage(video, 0, 0);

//       preview.src = canvas.toDataURL("image/jpeg");
//       preview.style.display = "block";
//       video.style.display = "none";
//     };

//     // Stop handler
//     document.getElementById("stopBtn").onclick = () => {
//       mediaStream.getTracks().forEach((track) => track.stop());
//       video.style.display = "none";
//       controls.remove();
//       mediaStream = null;
//     };
//   } catch (error) {
//     console.error("Camera error:", error);
//     showModal("Camera error", true);
//     if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
//   }
// }
document
  .getElementById("cameraButton")
  ?.addEventListener("click", handleCameraCapture);

// document?.getElementById("fileInput")?.addEventListener("change", (event) => {
//   preview.style.display = "block";

//   const file = event.target.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       document.getElementById("preview").src = e.target.result;
//     };
//     reader.readAsDataURL(file);
//   }
// });

// async function handleImageUpload() {
//   // If new image was captured (from camera or file)
//   if (document.getElementById("preview").src.startsWith("data:image")) {
//     return document.getElementById("preview").src;
//   }

//   // If file input was used
//   const fileInput = document.getElementById("fileInput");
//   if (fileInput.files.length > 0) {
//     return new Promise((resolve) => {
//       const reader = new FileReader();
//       reader.onload = (e) => {
//         resolve(e.target.result);
//       };
//       reader.readAsDataURL(fileInput.files[0]);
//     });
//   }

//   return existingImageUrl;
// }

const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadButton");
const fileName = document.getElementById("fileName");

fileInput.addEventListener("change", function (e) {
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
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\.]+/g, "")
    .toLowerCase();
}

// async function uploadImage() {
//   const file = fileInput.files[0];
//   if (!file) {
//     alert("Please select an image first.");
//     return;
//   }

//   const sanitizedFileName = sanitizeFileName(`${Date.now()}_${file.name}`);

//   const { data, error } = await supabase.storage
//     .from("images")
//     .upload(sanitizedFileName, file);

//   if (error) {
//     console.error(error);
//     alert("Error uploading file");
//     return;
//   }

//   // Get public URL
//   const { data: publicUrlData } = await supabase.storage
//     .from("images")
//     .getPublicUrl(data.path);

//   uploadedImageUrl = publicUrlData.publicUrl;

//   // Update preview with the new URL
//   const preview = document.getElementById("preview");
//   preview.src = uploadedImageUrl;
//   preview.style.display = "block";

//   showModal('Image uploaded successfully!',false, true);
// //   alert("Image uploaded successfully!");
// }

async function uploadImage() {
  const preview = document.getElementById("preview");
  let file;

  // Check for camera image first
  if (preview.src.startsWith('data:')) {
    file = dataURLtoFile(preview.src, `camera_${Date.now()}.jpg`);
  } 
  // Then check file input
  else if (fileInput.files.length > 0) {
    file = fileInput.files[0];
  }
  else {
    showModal("Please select an image or take a photo first", true);
    return;
  }

  const fileName = `${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(sanitizeFileName(fileName), file);

  if (error) {
    console.error(error);
    showModal("Error uploading image", true);
    return;
  }

  // Get public URL
  const { data: publicUrlData } = await supabase.storage
    .from("images")
    .getPublicUrl(data.path);

  uploadedImageUrl = publicUrlData.publicUrl;
  preview.src = uploadedImageUrl;
  showModal('Image uploaded successfully!',false,true);
}


window.uploadImage = uploadImage; // For inline event handlers

async function handleImageUpload() {
  const preview = document.getElementById("preview");
  if (preview.src.startsWith("data:image")) {
    return preview.src;
  }
  
  const fileInput = document.getElementById("fileInput");
  if (fileInput.files.length > 0) {
    uploadBtn.disabled = false;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(fileInput.files[0]);
    });
  }
  return existingImageUrl;
}


function validateAvailability(availability) {
  return Object.keys(availability).length > 0 ? availability : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  initializeGeoapify();
  document.getElementById("cameraButton")?.addEventListener('click', handleCameraCapture);
  // File input changes
    document.getElementById("fileInput")?.addEventListener('change', function(e) {
      if (this.files?.length > 0) {
        document.getElementById("fileName").textContent = this.files[0].name;
        const preview = document.getElementById("preview");
        preview.src = URL.createObjectURL(this.files[0]);
        preview.style.display = 'block';
      }});

      document.getElementById("uploadButton")?.addEventListener('click', uploadImage);

  if (currentListingId) {
    await populateForm(currentListingId);
  } else {
    console.error("No listing ID found in URL.");
  }

  document
    .getElementById("availabilityToggle")
    .addEventListener("change", function () {
      const container = document.getElementById("availabilityContainer");
      if (this.checked) {
        generateCalendar();
      } else {
        container.innerHTML = "";
      }
    });
});

function convertTo24HourFormat(time12) {
  if (!time12) return "";

  const cleaned = time12.trim().replace(/\s+/g, "");
  const match = cleaned.match(/(\d+):(\d+)(AM|PM)/i);
  if (!match) return "";

  let [_, hours, minutes, period] = match;
  hours = parseInt(hours);
  minutes = minutes.padStart(2, "0");

  if (period.toUpperCase() === "PM" && hours < 12) hours += 12;
  if (period.toUpperCase() === "AM" && hours === 12) hours = 0;

  return `${String(hours).padStart(2, "0")}:${minutes}`;
}

function generateCalendar() {
  const container = document.getElementById("availabilityContainer");
  container.innerHTML = "";

  daysOfWeek.forEach((day) => {
    const div = document.createElement("div");
    div.className = "day-row";
    div.innerHTML = `
    <label class="day-checkbox">
        <input type="checkbox" class="day-checkbox" data-day="${day}">
        ${day.charAt(0).toUpperCase() + day.slice(1)}
    </label>
    <div class="time-inputs">
        <input type="time" data-day="${day}-start" min="00:00" max="23:59">
        <span>to</span>
        <input type="time" data-day="${day}-end" min="00:00" max="23:59">
    </div>
`;

    container.appendChild(div);
  });
}

document
  .querySelector(".update-btn")
  .addEventListener("click", handleFormSubmission);

function showModal(message, isError = false, isMsg=false) {
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
  }
  else if (isMsg) {
    modal.classList.add("show");
    modalButton.textContent = "Close";
    modalButton.onclick = () => {
      overlay.classList.remove("show");
      modal.classList.remove("show");
    };
  }
  
  else {
    
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


function dataURLtoFile(dataurl, filename) {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new File([u8arr], filename, { type: mime });
}

async function handleCameraCapture() {
  const video = document.getElementById("cameraFeed");
  const preview = document.getElementById("preview");
  prelabel.style.display = 'none';
  try {
    // Stop any existing streams
    if (window.mediaStream) {
      window.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Create camera controls
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

    document.querySelector('.media-buttons').appendChild(controls);

    // Get camera access
    window.mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" }
    });

    video.srcObject = window.mediaStream;
    video.style.display = 'block';
    await video.play();

    // Capture handler
    controls.querySelector('.capture-btn').addEventListener('click', () => {
      const canvas = document.getElementById("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      
      preview.src = canvas.toDataURL('image/jpeg');
      preview.style.display = 'block';
      video.style.display = 'none';
      controls.remove();
      prelabel.style.display = 'flex';
      uploadBtn.disabled = false;
    });

    // Close handler
    controls.querySelector('.close-btn').addEventListener('click', () => {
      video.style.display = 'none';
      window.mediaStream.getTracks().forEach(track => track.stop());
      prelabel.style.display = 'flex';
      controls.remove();
    });

  } catch (error) {
    showModal(`Camera error: ${error.message}`, true);
  }
}