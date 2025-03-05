import { fetchListingData, updateListing } from '../../crud.js';
const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
let longitudeValue;
let latitudeValue;
let AddressChanged;

function getListingIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    console.log(params.id);
    return params.get('id');
    
}


async function handleFormSubmission(e) {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const submitBtn = document.querySelector('.update-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
        const imageUrl = await handleImageUpload();
        const availability = getAvailabilityData();
        const features = Array.from(document.querySelectorAll('input[name="features"]:checked'))
                        .map(cb => cb.value);

        let formData;

        if(AddressChanged)
        {
            formData = {
                title: document.getElementById('name')?.value.trim() || '',
                address: document.getElementById('autocomplete')?.value.trim() || '',
                price_per_hour: parseFloat(document.getElementById('price')?.value.trim() || ''),
                availability: validateAvailability(availability),
                image: imageUrl || existingImageUrl,
                longitude : latitudeValue,
                latitude : longitudeValue,
                features: features
                
            };
        }
        else
        {
            formData = {
                title: document.getElementById('name')?.value.trim() || '',
                address: document.getElementById('autocomplete')?.value.trim() || '',
                price_per_hour: parseFloat(document.getElementById('price')?.value.trim() || ''),
                availability: validateAvailability(availability),
                image: imageUrl || existingImageUrl,
                features: features
                
            };
        }

        
        
        await updateListing(currentListingId, formData);
      
        alert('Listing updated successfully!');
    } catch (error) {
        console.error('Error updating listing:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Listing';
    }
}

function getAvailabilityData() {
    const availability = {};
    document.querySelectorAll('.day-checkbox input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.checked) {
            const day = checkbox.dataset.day;
            const start = document.querySelector(`[data-day="${day}-start"]`)?.value || '';
            const end = document.querySelector(`[data-day="${day}-end"]`)?.value || '';
            availability[day] = `${start} - ${end}`;
        }
    });
    return availability;
}

function validateForm() {
    const requiredFields = [
        document.getElementById('name')?.value.trim(),
        document.getElementById('autocomplete')?.value.trim(),
        document.getElementById('price')?.value.trim()
    ];
    
    if (requiredFields.some(field => !field)) {
        alert('Please fill all required fields');
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
console.log(currentListingId);

async function handleImageUpload() {
    const fileInput = document.getElementById('fileInput');
    if (!fileInput?.files[0]) return existingImageUrl;

    try {
        const imageUrl = await uploadToStorage(fileInput.files[0]);
        return imageUrl;
    } catch (error) {
        console.error("Image upload failed:", error);
        return existingImageUrl;
    }
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
});








function convertTo24HourFormat(time12) {
    const [time, modifier] = time12.split(/(AM|PM)/);
    const [hours, minutes] = time.split(':');
    
    let parsedHours = parseInt(hours);
    if (modifier === 'PM' && parsedHours < 12) parsedHours += 12;
    if (modifier === 'AM' && parsedHours === 12) parsedHours = 0;
    
    return `${String(parsedHours).padStart(2, '0')}:${minutes}`;
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
                <input type="time" data-day="${day}-start">
                <span>to</span>
                <input type="time" data-day="${day}-end">
            </div>
        `;
        container.appendChild(div);
    });
}


async function populateForm(listingId) {
    if (!listingId) return;

    try {
        const data = await fetchListingData(listingId);
        currentListingId = listingId;
        existingImageUrl = data.image || '';

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

        
        if (data.isAvailable) {
            generateCalendar(); 

           
            setTimeout(() => {
                if (data.availability) {
                    Object.entries(data.availability).forEach(([day, timeRange]) => {
                        const [start12h, end12h] = timeRange.split(' - ');
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
        }

        if (data.features) {
            document.querySelectorAll('input[name="features"]').forEach(checkbox => {
                checkbox.checked = data.features.includes(checkbox.value);
            });
        }

    } catch (error) {
        console.error("Error populating form:", error);
    }
}
document.querySelector('.update-btn').addEventListener('click', handleFormSubmission);

