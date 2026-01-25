function filterOrders(status) {
    const cards = document.querySelectorAll(".order-card");
    const buttons = document.querySelectorAll(".filter-bar button");

    buttons.forEach(btn => btn.classList.remove("active"));
    event.target.classList.add("active");

    cards.forEach(card => {
        if (status === "ALL") {
            card.style.display = "flex";
        } else {
            card.style.display =
                card.dataset.status === status ? "flex" : "none";
        }
    });
}

function refreshPendingCount() {
    fetch("/cashier/pending-count/")
        .then(res => res.json())
        .then(data => {
            const el = document.getElementById("pending-count");
            if (el) {
                el.innerText = data.pending_orders;
            }
        })
        .catch(() => {
            console.warn("Pending count update failed");
        });
}

refreshPendingCount();

function updateStatus(select, orderId) {

    if (select.value === select.dataset.prev) return;

    fetch(`/cashier/update-status/${orderId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `status=${select.value}`
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            select.value = select.dataset.prev;
            return;
        }

        const card = select.closest(".order-card");

        // ✅ update filtering
        card.dataset.status = data.status;

        // ✅ update previous value
        select.dataset.prev = data.status;

        // ✅ update badge
        updateStatusBadge(card, data.status);
        refreshPendingCount();
    })
    .catch(() => {
        alert("Server error");
        select.value = select.dataset.prev;
    });
}


function updateStatusBadge(card, status) {

    // 🔍 find the status container
    const statusContainer = card.querySelector(".order-left .status");

    if (!statusContainer) return;

    // 🔍 find the span inside it
    const badge = statusContainer.querySelector("span");

    if (!badge) return;

    // update text
    badge.textContent = status.charAt(0) + status.slice(1).toLowerCase();

    // reset class
    badge.className = "";

    // add new class
    badge.classList.add(status.toLowerCase());
}



function getCSRFToken() {
    return document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");
}


function openOrderPopup(orderId) {
    document.getElementById("orderModal").classList.remove("hidden");

    fetch(`/cashier/order/${orderId}/`)
        .then(res => {
            if (!res.ok) throw new Error("Not JSON");
            return res.json();
        })
        .then(data => {
            // ... inside your .then(data => { ...
            document.getElementById("modalBody").innerHTML = `
                <span class="section-label">Customer Information</span>
                <p class="info-text" style="color:#333; font-weight:500;">${data.customer_name}</p>
                <p class="info-text">📞 ${data.phone || '9287455745'}</p>
                <p class="info-text">📍 ${data.address || 'rajkot gujarat india'}</p>
                
                <hr>
                
                <span class="section-label">Order Items</span>
                ${data.items.map(i => `
                    <div class="order-item">
                        <span>${i.qty}x ${i.name}</span>
                        <span>₹${i.price}</span>
                    </div>
                `).join("")}
                
                <hr>
                
                <div class="total-row">
                    <span>Total</span>
                    <span class="total-amount">₹${data.total_amount}</span>
                </div>
            `;
        })
        .catch(err => {
            alert("Please login as cashier");
            console.error(err);
        });

}

function closeModal() {
    document.getElementById("orderModal").classList.add("hidden");
}

function showSection(section, btn) {
    document.getElementById("ordersSection").classList.add("hidden");
    document.getElementById("menuSection").classList.add("hidden");

    document.querySelectorAll(".tab-btn").forEach(b =>
        b.classList.remove("active")
    );

    if (section === "orders") {
        document.getElementById("ordersSection").classList.remove("hidden");
    } else {
        document.getElementById("menuSection").classList.remove("hidden");
    }

    btn.classList.add("active");
}



function toggleMenuItem(itemId, checkbox) {
    fetch(`/cashier/toggle-menu/${itemId}/`, {
        method: "POST",
        headers: {
            "X-CSRFToken": getCSRFToken(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            available: checkbox.checked
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            checkbox.checked = !checkbox.checked;
            alert("Failed to update");
            return;
        }

        const card = checkbox.closest(".menu-item-card");
        const text = card.querySelector(".status-text");

        if (checkbox.checked) {
            card.classList.remove("sold-out");
            text.innerText = "Available";
        } else {
            card.classList.add("sold-out");
            text.innerText = "Sold Out";
        }
    })
    .catch(() => {
        checkbox.checked = !checkbox.checked;
        alert("Server error");
    });
}
