document.addEventListener("DOMContentLoaded", () => {
  const inputField = document.getElementById("location");
  const container = inputField.closest(".searchInputContainer") || inputField.parentNode;
  let suggestionsList = document.getElementById("suggestions");
  if (!suggestionsList) {
    suggestionsList = document.createElement("div");
    suggestionsList.setAttribute("id", "suggestions");
    suggestionsList.setAttribute("role", "listbox");
    container.style.position = "relative";
    container.appendChild(suggestionsList);
  }

  let latitudeValue = null;
  let longitudeValue = null;
  let debounceTimer = null;

  function showSuggestions(html) {
    suggestionsList.innerHTML = html;
    suggestionsList.classList.add("suggestions-visible");
  }

  function hideSuggestions() {
    suggestionsList.innerHTML = "";
    suggestionsList.classList.remove("suggestions-visible");
  }

  /** Returns current local date/time in YYYY-MM-DDTHH:mm for datetime-local input */
  function getCurrentDateTimeLocal() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  const datetimeInput = document.getElementById("datetime");
  if (datetimeInput && !datetimeInput.value) {
    datetimeInput.value = getCurrentDateTimeLocal();
  }

  inputField.addEventListener("input", () => {
    const location = inputField.value.trim();
    clearTimeout(debounceTimer);

    if (location.length === 0) {
      hideSuggestions();
      return;
    }

    showSuggestions('<div class="suggestion-loading">Searching...</div>');

    debounceTimer = setTimeout(async () => {
      await fetchLocationSuggestions(location);
    }, 280);
  });

  inputField.addEventListener("focus", () => {
    if (inputField.value.trim().length > 0 && suggestionsList.children.length > 0) {
      suggestionsList.classList.add("suggestions-visible");
    }
  });

  // Function to fetch location suggestions based on user input
  async function fetchLocationSuggestions(location) {
    const apiKey = "d79219fb6dcc45159636535b526e950f";
    try {
      const response = await fetch(
        `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
          location
        )}&apiKey=${apiKey}&limit=8`
      );
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        displaySuggestions(data.features);
      } else {
        showSuggestions('<div class="suggestion-empty">No locations found. Try a different search.</div>');
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      showSuggestions('<div class="suggestion-error">Unable to load suggestions. Check your connection.</div>');
    }
  }

  // Function to display location suggestions
  function displaySuggestions(features) {
    suggestionsList.innerHTML = "";
    suggestionsList.classList.add("suggestions-visible");

    features.forEach((feature) => {
      const props = feature.properties;
      const formatted = props.formatted || "";
      const secondLine = [props.city, props.state, props.country].filter(Boolean).join(", ") || null;

      const suggestionItem = document.createElement("div");
      suggestionItem.classList.add("suggestion-item");
      suggestionItem.setAttribute("role", "option");
      suggestionItem.innerHTML = secondLine
        ? `<span class="suggestion-main">${escapeHtml(formatted)}</span><span class="suggestion-sub">${escapeHtml(secondLine)}</span>`
        : `<span class="suggestion-main">${escapeHtml(formatted)}</span>`;

      suggestionItem.addEventListener("click", () => {
        inputField.value = formatted;
        latitudeValue = props.lat;
        longitudeValue = props.lon;
        if (datetimeInput) datetimeInput.value = getCurrentDateTimeLocal();
        hideSuggestions();
      });

      suggestionsList.appendChild(suggestionItem);
    });
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  // Close suggestions when clicking outside
  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) {
      hideSuggestions();
    }
  });

  // Handle form submission
  const searchForm = document.getElementById("searchForm");
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    hideSuggestions();
    const datetime = document.getElementById("datetime").value;
    if (latitudeValue && longitudeValue && datetime) {
      const searchParams = new URLSearchParams({
        location: inputField.value,
        date: datetime,
        latitude: latitudeValue,
        longitude: longitudeValue,
      });
      window.location.href = `/pages/userPages/searchResultsPage.html?${searchParams.toString()}`;
    } else {
      alert("Please select a location from the list and choose a date & time.");
    }
  });
});

const userId = localStorage.getItem("userId");
console.log("Homepage Stored userId in localStorage:", userId);
