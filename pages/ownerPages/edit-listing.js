import { fetchListingData, updateListing } from '../../js/crud.js';
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
let longitudeValue;
let latitudeValue;
let AddressChanged;

function getListingIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    console.log(params.id);
    return params.get('id');
    
}



async function populateForm(listingId) {
    if (!listingId) return;

    try {
        const data = await fetchListingData(listingId);
        currentListingId = listingId;
        existingImageUrl = data.image || '';
        // Existing image handling
        if (data.image) {
            const preview = document.getElementById('preview');
            preview.src = data.image;
            preview.style.display = 'block'; // Add this line
        }

        // Basic fields
        document.getElementById('name').value = data.title || '';
        document.getElementById('autocomplete').value = data.address || '';
        document.getElementById('price').value = data.price_per_hour || '';
        document.getElementById('preview').src = existingImageUrl;

        // Handle availability toggle
        const availabilityToggle = document.getElementById('availabilityToggle');
        availabilityToggle.checked = data.isAvailable;
        document.getElementById('availabilityStatus').textContent = 
            data.isAvailable ? "Available" : "Not Available";

        // Generate calendar only if available
        const availabilityContainer = document.getElementById('availabilityContainer');
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
                        const startInput = document.querySelector(`[data-day="${day}-start"]`);
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
            availabilityContainer.innerHTML = '';
        }

    } catch (error) {
        console.error("Error populating form:", error);
    }
}






async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitBtn = document.querySelector('.update-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const isAvailable = document.getElementById('availabilityToggle').checked;
        let availability;

        
        if (isAvailable) {
            availability = getAvailabilityData();
            if (!availability) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Listing';
                return;
            }
        } else {
            availability = null; 
        }

        const imageUrl = await handleImageUpload();

        let formData;

        if (AddressChanged) {
            formData = {
                title: document.getElementById('name')?.value.trim() || '',
                address: document.getElementById('autocomplete')?.value.trim() || '',
                price_per_hour: parseFloat(document.getElementById('price')?.value.trim() || ''),
                isAvailable: isAvailable,
                availability: availability,
                image: imageUrl || existingImageUrl,
                longitude: longitudeValue,
                latitude: latitudeValue
            };
        } else {
            formData = {
                title: document.getElementById('name')?.value.trim() || '',
                address: document.getElementById('autocomplete')?.value.trim() || '',
                price_per_hour: parseFloat(document.getElementById('price')?.value.trim() || ''),
                isAvailable: isAvailable,
                availability: availability,
                image: imageUrl || existingImageUrl
            };
        }

        await updateListing(currentListingId, formData);
        showModal('Listing updated successfully!');
    } catch (error) {
        console.error('Error updating listing:', error);
        showModal(`Error updating listing`,true);
       
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Listing';
    }
}


function convertTo12HourFormat(time24) {
    let [hours, minutes] = time24.split(':');
    hours = parseInt(hours);

    const period = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12; // Convert 0 to 12 for AM

    return `${hours}:${minutes} ${period}`;
}



function getAvailabilityData() {
    const errorElement = document.getElementById('availabilityError');
    errorElement.style.display = 'none';
    let isValid = true;
    const availability = {};

    document.querySelectorAll('.day-checkbox input[type="checkbox"]').forEach(checkbox => {
        const day = checkbox.dataset.day;
        const startInput = document.querySelector(`[data-day="${day}-start"]`);
        const endInput = document.querySelector(`[data-day="${day}-end"]`);

        if (checkbox.checked) {
            const startTime = startInput.value;
            const endTime = endInput.value;

            if (!startTime || !endTime) {
                errorElement.textContent = `Please set both start and end times for ${day}.`;
                errorElement.style.display = 'block';
                isValid = false;
            } else if (startTime >= endTime) {
                errorElement.textContent = `End time must be after start time on ${day}.`;
                errorElement.style.display = 'block';
                isValid = false;
            } else {
                availability[day] = `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(endTime)}`;
            }
        }
    });

    return isValid ? availability : false;
}

function validateForm() {
    const requiredFields = [
        document.getElementById('name')?.value.trim(),
        document.getElementById('autocomplete')?.value.trim(),
        document.getElementById('price')?.value.trim()
    ];
    
    if (requiredFields.some(field => !field)) {
        showModal('Please fill all required fields',true);

        return false;
    }
    const isAvailable = document.getElementById('availabilityToggle').checked;
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
                `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}`
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

            data.features.forEach(feature => {
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
        if (!inputField.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = "none";
        }
    });
}



let existingImageUrl = '';
let currentListingId = getListingIdFromUrl();
// console.log(currentListingId);

let mediaStream = null;

async function handleCameraCapture() {
    try {
        // Clear previous preview
        const preview = document.getElementById('preview');
        preview.style.display = 'none';

        // Stop existing stream
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
        }

        // Create camera controls
        const controls = document.createElement('div');
        controls.className = 'camera-controls';
        controls.innerHTML = `
            <button type="button" id="captureBtn">Capture</button>
            <button type="button" id="stopBtn">Stop Camera</button>
        `;
        document.querySelector('.media-buttons').appendChild(controls);

        // Get camera access
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        // Show video feed
        const video = document.getElementById('cameraFeed');
        video.style.display = 'block';
        video.srcObject = mediaStream;
        
        // Play video feed
        try {
            await video.play();
        } catch (err) {
            console.log('Video play error:', err);
        }

        // Capture handler
        document.getElementById('captureBtn').onclick = () => {
            const canvas = document.getElementById('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            
            preview.src = canvas.toDataURL('image/jpeg');
            preview.style.display = 'block';
            video.style.display = 'none';
        };

        // Stop handler
        document.getElementById('stopBtn').onclick = () => {
            mediaStream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            controls.remove();
            mediaStream = null;
        };

    } catch (error) {
        console.error('Camera error:', error);
        showModal('Camera error',true);
        if (mediaStream) mediaStream.getTracks().forEach(track => track.stop());
    }
}
document.getElementById('cameraButton')?.addEventListener('click', handleCameraCapture);




document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview').src = e.target.result; 
        };
        reader.readAsDataURL(file);
    }
});

async function handleImageUpload() {
    // If new image was captured (from camera or file)
    if (document.getElementById('preview').src.startsWith('data:image')) {
        return document.getElementById('preview').src;
    }
    
    // If file input was used
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length > 0) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve(e.target.result);
            };
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

    if (currentListingId) {
        await populateForm(currentListingId);
    } else {
        console.error("No listing ID found in URL.");
    }

    
document.getElementById("availabilityToggle").addEventListener("change", function() {
    const container = document.getElementById('availabilityContainer');
    if (this.checked) {
        generateCalendar();
       
    } else {
        container.innerHTML = '';
    }
});
});

function convertTo24HourFormat(time12) {
    
    if (!time12) return '';
    
    const cleaned = time12.trim().replace(/\s+/g, '');
    const match = cleaned.match(/(\d+):(\d+)(AM|PM)/i);
    if (!match) return '';
    
    let [_, hours, minutes, period] = match;
    hours = parseInt(hours);
    minutes = minutes.padStart(2, '0');

   
    if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
    if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;

    return `${String(hours).padStart(2, '0')}:${minutes}`;
}







function generateCalendar() {
    const container = document.getElementById('availabilityContainer');
    container.innerHTML = '';

    daysOfWeek.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day-row';
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


document.querySelector('.update-btn').addEventListener('click', handleFormSubmission);


function showModal(message, isError = false) {
    let modal = document.getElementById("messageModal");
    let overlay = document.querySelector('.modal-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
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
            modal.classList.remove("show")};
    } else {
        modal.classList.remove("error");
        modalButton.textContent = "Go to Homepage";
        modalButton.onclick = () => {
            overlay.classList.remove("show");
            window.location.href = "ownerHomePage.html"};
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
