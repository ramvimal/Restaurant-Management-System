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
