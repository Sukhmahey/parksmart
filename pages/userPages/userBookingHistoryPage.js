import { db } from "../../js/firebase.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    const container = document.getElementById("bookingContainer");

    if (!userId) {
        container.innerHTML = "<p>No booking history found.</p>";
        return;
    }

    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("user_id", "==", userId));
        const querySnapshot = await getDocs(q);

        let bookings = [];
        querySnapshot.forEach((doc) => {
            bookings.push(doc.data());
        });

        if (bookings.length === 0) {
            container.innerHTML = "<p>No booking history found.</p>";
            return;
        }

        const sortAndRender = (order = "latest") => {
            const sorted = bookings.sort((a, b) => {
                const dateA = a.start_time.toDate();
                const dateB = b.start_time.toDate();
                return order === "latest" ? dateB - dateA : dateA - dateB;
            });

            const cards = container.querySelectorAll(".bookingCard");
            cards.forEach(card => card.remove());

            sorted.forEach((booking) => {
                const bookingCard = document.createElement("div");
                bookingCard.classList.add("bookingCard");
                bookingCard.innerHTML = `
                    <div class="bookingImage">
                        <img src="${booking.imgURL}" alt="Parking Spot Image">
                    </div>
                    <div class="bookingInfo">
                        <h2>${booking.name}</h2>
                        <p>Date: ${new Date(booking.start_time.toDate()).toLocaleDateString()}</p>
                        <p>Time: ${new Date(booking.start_time.toDate()).toLocaleTimeString()} - ${new Date(booking.end_time.toDate()).toLocaleTimeString()}</p>
                        <p>Status: ${booking.status}</p>
                        <p>Total Price: $${booking.total_price}</p>
                    </div>
                `;
                container.appendChild(bookingCard);
            });
        };

        sortAndRender();

        const sortDropdown = document.getElementById("sortOrder");
        sortDropdown.addEventListener("change", (e) => {
            sortAndRender(e.target.value);
        });

    } catch (error) {
        console.error("Error fetching booking history:", error);
        container.innerHTML = "<p class='noBookingHistory'>Error loading booking history.</p>";
    }
});
