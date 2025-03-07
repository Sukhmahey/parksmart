document.getElementById("searchForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent default form submission

    const location = document.getElementById("location").value;
    const datetime = document.getElementById("datetime").value;

    console.log("here",location, datetime);

    // Redirect with query parameters
    window.location.href = `/pages/userPages/searchResultsPage.html?keyword=${location}&datetime=${datetime}`;
});