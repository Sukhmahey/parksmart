

let bookings = [
    { 
        name: "Parking Spot A", 
        location: "Downtown", 
        date: "2025-03-01", 
        time: "10:00 AM", 
        image: "https://cdn.pixabay.com/photo/2014/10/25/19/23/multi-storey-car-park-502959_1280.jpg" 
    },
    { 
        name: "Parking Spot B", 
        location: "Richmond", 
        date: "2025-03-02", 
        time: "11:00 AM", 
        image: "https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg" 
    },
    { 
        name: "Parking Spot C", 
        location: "Surrey", 
        date: "2025-03-03", 
        time: "12:00 PM", 
        image: "https://cdn.pixabay.com/photo/2014/10/25/19/23/multi-storey-car-park-502959_1280.jpg" 
    },
    { 
        name: "Parking Spot D", 
        location: "Burnaby", 
        date: "2025-03-04", 
        time: "01:00 PM", 
        image: "https://cdn.pixabay.com/photo/2016/11/29/09/16/architecture-1868667_1280.jpg" 
    }
];




let sortOrder = 'newest';

function renderBookings(filteredBookings = bookings) {
    const bookingList = document.getElementById("bookingList");
    bookingList.innerHTML = "";
    filteredBookings.forEach(booking => {
        let listItem = document.createElement("li");
        listItem.classList.add("booking-item");
        listItem.innerHTML = `
            <img src="${booking.image}" alt="Parking Image">
            <div class="booking-details">
                <strong>${booking.name}</strong><br>
                ${booking.location}<br>
                ${booking.date}<br>
                ${booking.time}
            </div>
            <div class="arrow">&gt;</div>
        `;
        bookingList.appendChild(listItem);
    });
}

function toggleSortOrder() {
    if (sortOrder === 'newest') {
        bookings.sort((a, b) => new Date(a.date) - new Date(b.date));
        sortOrder = 'oldest';
        document.getElementById("filterButton").textContent = "Filter: Oldest to Newest";
    } else {
        bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        sortOrder = 'newest';
        document.getElementById("filterButton").textContent = "Filter: Newest to Oldest";
    }
    renderBookings();
}

function searchBookings() {
    const searchTerm = document.getElementById("searchInput").value.toLowerCase();
    const filteredBookings = bookings.filter(booking => 
        booking.name.toLowerCase().includes(searchTerm) ||
        booking.location.toLowerCase().includes(searchTerm) ||
        booking.date.toLowerCase().includes(searchTerm) ||
        booking.time.toLowerCase().includes(searchTerm)
    );
    renderBookings(filteredBookings);
}

document.getElementById("filterButton").addEventListener("click", toggleSortOrder);
document.getElementById("searchButton").addEventListener("click", searchBookings);
document.addEventListener("DOMContentLoaded", () => renderBookings());