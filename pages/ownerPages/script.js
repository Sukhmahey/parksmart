import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const bookingsContainer = document.querySelector(".tab-content");

    async function fetchBookings() {
        const snapshot = await getDocs(collection(db, "bookings"));
        let bookingsHTML = "";

        snapshot.forEach(doc => {
            const data = doc.data();
            bookingsHTML += `
                <div class="booking-card">
                    <img src="${data.image || 'default.jpg'}" alt="Parking Image">
                    <div class="details">
                        <h4>${data.title}</h4>
                        <p>${data.address}</p>
                        <p>${new Date(data.start_time.toDate()).toLocaleString()} - ${new Date(data.end_time.toDate()).toLocaleString()}</p>
                    </div>
                    <div class="arrow">&rarr;</div>
                </div>
            `;
        });
        bookingsContainer.innerHTML = bookingsHTML;
    }

    await fetchBookings();
});
