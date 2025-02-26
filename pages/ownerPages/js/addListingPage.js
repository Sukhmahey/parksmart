
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
const video = document.getElementById("cameraFeed");
const canvas = document.getElementById("canvas");
const preview = document.getElementById("preview");



const firebaseConfig = {
    apiKey: "AIzaSyCLkQlLAXrx78VjhP3S6w6zLhCPmXNyMtQ",
    authDomain: "parksmartowner.firebaseapp.com",
    projectId: "parksmartowner",
    storageBucket: "parksmartowner.appspot.com",
    messagingSenderId: "571166769031",
    appId: "1:571166769031:web:394821c17335e9afca1d22",
    measurementId: "G-2WDLX03JLW"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Initialize Geoapify Autocomplete


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
// Form Submission Handler
const handleFormSubmission = async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        location: document.getElementById('autocomplete').value.trim(),
        price: document.getElementById('price').value.trim(),
        isAvailable: document.querySelector('.switch input').checked,
        image: await handleImage()
    };

    if (!formData.name || !formData.location || !formData.price) {
        return alert('Please fill in all required fields');
    }
    if (isNaN(formData.price)) {
        return alert('Please enter a valid price');
    }

    try {
        await addDoc(collection(db, "OwnerListings"), {
            Listing_name: formData.name,
            Street_name: formData.location,
            availability: formData.isAvailable,
            image: formData.image || "https://loremflickr.com/640/480",
            // image: "https://loremflickr.com/640/480",
            ownerid: 4,
            price: parseFloat(formData.price),
            timestamp: new Date()
        });

        document.getElementById('name').value = '';
        document.getElementById('autocomplete').value = '';
        document.getElementById('price').value = '';
        document.getElementById('fileInput').value = '';
        document.getElementById('preview').style.display = 'none';

        alert('Listing added successfully!');
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







