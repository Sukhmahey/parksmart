import { db } from "../../js/firebase.js"; 
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";



document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    const mainSection = document.querySelector(".mainSection");
    mainSection.innerHTML = ""; // Clear existing cards
    
    if (!userId) {
        mainSection.innerHTML = "<p>No booking history found.</p>";
        return;
    }

    try {
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("user_id", "==", userId));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            mainSection.innerHTML = "<p>No booking history found.</p>";
        } else {
            querySnapshot.forEach((doc) => {
                const booking = doc.data();
                
                const bookingCard = document.createElement("div");
                bookingCard.classList.add("bookingContainer");
                bookingCard.innerHTML = `
                    <div class="bookingCard">
                        <div class="bookingImage">
                            <img src="https://picsum.photos/100" alt="Parking Spot Image">
                        </div>
                        <div class="bookingInfo">
                            <h2>Booking ID: ${booking.booking_id}</h2>
                            <p>Parking Spot: ${booking.space_id}</p>
                            <p>Date: ${new Date(booking.start_time.toDate()).toLocaleDateString()}</p>
                            <p>Time: ${new Date(booking.start_time.toDate()).toLocaleTimeString()} - ${new Date(booking.end_time.toDate()).toLocaleTimeString()}</p>
                            <p>Status: ${booking.status}</p>
                            <p>Total Price: $${booking.total_price}</p>
                        </div>
                    </div>
                `;
                mainSection.appendChild(bookingCard);
            });
        }
    } catch (error) {
        console.error("Error fetching booking history:", error);
        mainSection.innerHTML = "<p>Error loading booking history.</p>";
    }
});
