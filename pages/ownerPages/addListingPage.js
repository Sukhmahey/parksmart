

import { addParkingSpace } from "../../js/crud.js";

const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");
let longitudeValue;
let latitudeValue;
let ownerId = localStorage.getItem("userId");
console.log(ownerId)

const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];



function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(':');
    const parsedHours = parseInt(hours);
    const ampm = parsedHours >= 12 ? 'PM' : 'AM';
    const hours12 = parsedHours % 12 || 12; 
    
    return `${hours12}:${minutes}${ampm}`;
}
let availableNow;
document.getElementById("availabilityToggle").addEventListener("change", function() {
    const statusText = document.getElementById("availabilityStatus");
    const isAvailable = this.checked;
    availableNow = isAvailable;
    statusText.textContent = isAvailable ? "Available" : "Not Available";
    console.log("Availability:", isAvailable);
    isAvailable ? calender() : calendercontainer.innerHTML='';
    });
    
    
    const calendercontainer = document.getElementById('availabilityContainer');
function calender()
{
    
    
    daysOfWeek.forEach(day => {
        const div = document.createElement('div');
        div.className = 'day-row';
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

            // Validate required times
            if (!startTime || !endTime) {
                errorElement.textContent = `Please set times for ${day}`;
                errorElement.style.display = 'block';
                isValid = false;
            }

            // Validate time order
            if (startTime >= endTime) {
                errorElement.textContent = `End time must be after start time on ${day}`;
                errorElement.style.display = 'block';
                isValid = false;
            }

            // Convert to AM/PM format
            if (isValid) {
                availability[day] = 
                    `${convertTo12HourFormat(startTime)} - ${convertTo12HourFormat(endTime)}`;
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
            const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&apiKey=${apiKey}`);
            const data = await response.json();
            displaySuggestions(data);
        } catch (error) {
            console.error("Error fetching autocomplete results:", error);
        }
    });

    function displaySuggestions(data) {
        suggestionsList.innerHTML = ""; // Clear old suggestions

        if (data.features && data.features.length > 0) {
            suggestionsList.style.display = "block"; // Show suggestions

            data.features.forEach(feature => {
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
        if (!inputField.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.style.display = "none";
        }
    });
});


// Image Handler


const handleImage = async () => {
    const preview = document.getElementById('preview');
    if (!preview.src.startsWith('data:image')) return null;

    return preview.src;
};



async function handleCameraCapture() {
    let stream;
    try {
        const video = document.getElementById('cameraFeed');
        const canvas = document.getElementById('canvas');
        const preview = document.getElementById('preview');

        const controls = document.createElement('div');
        controls.className = 'media-buttons';
        controls.innerHTML = `
            <button type="button" id="snapBtn">Capture</button>
            <button type="button" id="closeBtn">Close Camera</button>
        `;
        
        video.parentNode.insertBefore(controls, video.nextSibling);
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }
        });

        video.style.display = 'block';
        video.srcObject = stream;
        await video.play();

        // Capture handler
        document.getElementById('snapBtn').addEventListener('click', () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0);
            preview.src = canvas.toDataURL('image/jpeg', 0.8);
            preview.style.display = 'block';
        });

        // Cleanup handler
        document.getElementById('closeBtn').addEventListener('click', () => {
            stream.getTracks().forEach(track => track.stop());
            video.style.display = 'none';
            controls.remove();
        });

    } catch (error) {
        alert(`Camera error: ${error.message}`);
        if (stream) stream.getTracks().forEach(track => track.stop());
    }
}

const handleFormSubmission = async (e) => {
    e.preventDefault();
    console.log("Values")
    console.log(longitudeValue);
    console.log(latitudeValue);
    // Validate availability
    const availability = validateAvailability();
    if (!availability) return;

    // Collect features
    // const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
    //                     .map(cb => cb.value);

    
    const formData = {
        name: document.getElementById('name').value.trim(),
        location: document.getElementById('autocomplete').value.trim(),
        price: document.getElementById('price').value.trim(),
        image: await handleImage(),
        // image: "https://loremflickr.com/640/480",
        longitude: longitudeValue,
        latitude: latitudeValue,
        isAvailable: availableNow,
        availability: availability,
        // features: features
    };

    // Validation 
    if (!formData.name || !formData.location || !formData.price) {
        return alert('Please fill in all required fields');
    }
    if (isNaN(formData.price)) {
        return alert('Please enter a valid price');
    }

    try {
       
        
        // addParkingSpace function from crud.
        await addParkingSpace(
            ownerId,
            formData.name,
            formData.location,
            parseFloat(formData.price),
            formData.image || "https://loremflickr.com/640/480",
            formData.longitude,
            formData.latitude,
            formData.isAvailable,
            formData.availability,
            // formData.features

        );

        // Reset form 
        document.getElementById('name').value = '';
        document.getElementById('autocomplete').value = '';
        document.getElementById('price').value = '';
        document.getElementById('preview').style.display = 'none';
        alert('Parking space added successfully!');
    } catch (error) {
        console.error('Submission error:', error);
        alert(`Error saving listing: ${error.message}`);
    }
};


// Event Listeners
if (document.getElementById('fileInput')) {
    document.getElementById('fileInput').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            document.getElementById('preview').src = e.target.result;
            document.getElementById('preview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    const cameraButton = document.getElementById("cameraButton");
    if (cameraButton) {
        cameraButton.addEventListener("click", handleCameraCapture);
    } else {
        console.error("Camera button not found in DOM!");
    }
});


document.getElementById('cameraButton')?.addEventListener('click', handleCameraCapture);
document.querySelector('.update-btn')?.addEventListener('click', handleFormSubmission);







