const cartSidebar = document.getElementById("cartSidebar");
const cartOverlay = document.getElementById("cartOverlay");
const closeCart = document.getElementById("closeCart");
const cartBtn = document.getElementById("cartBtn"); // header cart icon
const msg = document.querySelector(".message-add-to-cart");
const add_to_cart_btn = document.querySelector(".btn");

function goToCheckout() {
    window.location.href = "/checkout/";
}


function toggleCart() {
    cartSidebar.classList.toggle("open");
    cartOverlay.classList.toggle("show");

    document.body.classList.toggle("cart-open");

    if (cartSidebar.classList.contains("open")) {
        document.body.style.overflow = "hidden";
    } else {
        document.body.style.overflow = "auto";
    }
}


cartBtn.addEventListener("click", toggleCart);
closeCart.addEventListener("click", toggleCart);

function updateSideCart(data) {
    const cartDiv = document.getElementById("side-cart");
    const totalSpan = document.getElementById("cart-total");
    const badge = document.querySelector(".item-count-badge");

    const emptyCart = document.getElementById("emptyCart");
    const cartScroll = document.getElementById("cartScroll");
    const cartFooter = document.getElementById("cartFooter");

    cartDiv.innerHTML = "";
    let count = 0;

    for (let id in data.cart) {
        const item = data.cart[id];
        count += item.quantity;

        cartDiv.innerHTML += `
            <div class="cart-item-card">
                <img src="${item.image}" class="cart-img">
                <div class="cart-middle">
                    <h4>${item.name}</h4>
                    <div class="qty-box">
                        <button onclick="decreaseQty(${id})">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="increaseQty(${id})">+</button>
                    </div>
                </div>
                <div class="cart-right">
                    <button class="trash" onclick="removeItem(${id})">🗑</button>
                    <div class="price">₹${(item.price * item.quantity).toFixed(2)}</div>
                </div>
            </div>
        `;
    }

    // 🔥 SWITCH UI HERE
    if (count === 0) {
        emptyCart.style.display = "flex";
        cartScroll.style.display = "none";
        cartFooter.style.display = "none";
    } else {
        emptyCart.style.display = "none";
        cartScroll.style.display = "block";
        cartFooter.style.display = "block";
    }

    badge.innerText = `${count} items`;
    totalSpan.innerText = "₹" + data.total_price.toFixed(2);
}


document.getElementById("categorySelect").addEventListener("change", function () {
    const selectedCategory = this.value;
    if (!selectedCategory) return;
    
    const categoryContainer = document.getElementById("menuCategories");
    const categorySections = categoryContainer.querySelectorAll(".category-section");
    
    categorySections.forEach(section => {
        if (section.dataset.category === selectedCategory) {
            categoryContainer.prepend(section);
            
            // optional: smooth scroll to menu title
            document.querySelector(".menu-title").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    });
});



function showToast(message, type = "success") {
    const toast = document.getElementById("toast");
    
    toast.innerText = message;
    toast.className = `toast show ${type}`;
    
    setTimeout(() => {
        toast.className = "toast";
    }, 2000);
}

function addToCart(id) {
    fetch(`/add-to-cart/${id}/`)
    .then(res => res.json())
    .then(data => {
        updateSideCart(data);          // UI updated
        document.getElementById("cartCount").innerText = data.total_items;
        showToast("Item added to cart 🛒");
    });
}

function increaseQty(id) {
    fetch(`/cart/increase/${id}/`)
    .then(res => res.json())
    .then(data => {
        updateSideCart(data);
        showToast("Quantity increased");
    });
}

function decreaseQty(id) {
    fetch(`/cart/decrease/${id}/`)
    .then(res => res.json())
    .then(data => {
        updateSideCart(data);
        showToast("Quantity decrease");
    });
}

function removeItem(id) {
    fetch(`/cart/remove/${id}/`)
    .then(res => res.json())
    .then(data => {
        updateSideCart(data);
        showToast("Item removed from cart", "remove");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    fetch('/get-cart/')
    .then(res => res.json())
    .then(updateSideCart);
});

