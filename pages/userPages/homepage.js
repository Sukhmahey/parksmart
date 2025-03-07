document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById("location");
    const suggestionsList = document.createElement("div");
    suggestionsList.setAttribute("id", "suggestions"); 
    inputField.parentNode.appendChild(suggestionsList); 

    let latitudeValue = null;
    let longitudeValue = null;


    inputField.addEventListener("input", async () => {
        const location = inputField.value.trim(); 

        
        if (location.length > 0) {
            await fetchLocationSuggestions(location);
        } else {
            suggestionsList.innerHTML = "";
        }
    });

    // Function to fetch location suggestions based on user input
    async function fetchLocationSuggestions(location) {
        const apiKey = "d79219fb6dcc45159636535b526e950f"; 
        try {
            const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(location)}&apiKey=${apiKey}`);
            const data = await response.json();

            if (data.features && data.features.length > 0) {
                displaySuggestions(data.features); 
            } else {
                suggestionsList.innerHTML = "<p>No suggestions found.</p>";
            }
        } catch (error) {
            console.error("Error fetching location suggestions:", error);
        }
    }

    // Function to display location suggestions
    function displaySuggestions(features) {
        suggestionsList.innerHTML = ""; 

        features.forEach(feature => {
            const suggestionItem = document.createElement("div");
            suggestionItem.classList.add("suggestion-item");
            suggestionItem.textContent = feature.properties.formatted; 

            // Handle user selection of a suggestion
            suggestionItem.addEventListener("click", () => {
                inputField.value = feature.properties.formatted; 
                latitudeValue = feature.properties.lat; 
                longitudeValue = feature.properties.lon; 
                suggestionsList.innerHTML = ""; 
            });

            suggestionsList.appendChild(suggestionItem); 
        });
    }

    // Close suggestions when clicking outside of the input field or the suggestions list
    document.addEventListener("click", (event) => {
        if (!inputField.contains(event.target) && !suggestionsList.contains(event.target)) {
            suggestionsList.innerHTML = ""; 
        }
    });

    // Handle form submission 
    const searchForm = document.getElementById("searchForm");
    searchForm.addEventListener("submit", (event) => {
        event.preventDefault(); // Prevent form submission
        const datetime = document.getElementById("datetime").value;
        // Check if all required fields have values
        if (latitudeValue && longitudeValue && datetime) {
            const searchParams = new URLSearchParams({
                location: inputField.value,
                date: datetime,
                latitude: latitudeValue,
                longitude: longitudeValue
            });

            // Redirect to the results page with the search parameters
            window.location.href = `searchResultsPage.html?${searchParams.toString()}`;
        } else {
            alert("Please fill in all fields.");
        }
    });
});
