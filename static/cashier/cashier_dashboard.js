// const modal = document.getElementById("itemModal");
// const btn = document.getElementById("openModalBtn");
// const span = document.getElementsByClassName("close")[0];

// btn.onclick = () => modal.style.display = "block";
// span.onclick = () => modal.style.display = "none";

// window.onclick = (event) => {
//     if (event.target == modal) modal.style.display = "none";
// }

// // Tab Switching Logic
// function openTab(tabName) {
//     let contents = document.getElementsByClassName("tab-content");
//     let links = document.getElementsByClassName("tab-link");
    
//     for (let content of contents) content.classList.remove("active");
//     for (let link of links) link.classList.remove("active");
    
//     document.getElementById(tabName).classList.add("active");
//     event.currentTarget.classList.add("active");
// }

// // AJAX Form Submission (No Reload)
// document.getElementById('addItemForm').addEventListener('submit', function(e) {
//     e.preventDefault(); // Prevents page reload

//     const formData = new FormData(this);
    
//     /* In a real Django setup, you would use:
//     fetch('/your-api-endpoint/', {
//         method: 'POST',
//         body: formData,
//         headers: { 'X-CSRFToken': getCookie('csrftoken') }
//     })
//     */

//     // Simulated Success Logic for UI demonstration:
//     const menuList = document.getElementById('menuList');
//     if(menuList.querySelector('.empty-state')) menuList.innerHTML = '';

//     const newItem = document.createElement('div');
//     newItem.style.padding = "10px";
//     newItem.style.borderBottom = "1px solid #eee";
//     newItem.innerHTML = `<strong>${formData.get('name')}</strong> - $${formData.get('price')}`;
    
//     menuList.appendChild(newItem);

//     // Update Counter
//     const counter = document.getElementById('menu-count');
//     counter.innerText = parseInt(counter.innerText) + 1;

//     // Reset and Close
//     this.reset();
//     modal.style.display = "none";
//     alert("Item added successfully!");
// });

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


function updateStatus(select, orderId) {
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
            location.reload();
        }
    })
    .catch(err => {
        console.error(err);
        alert("Something went wrong");
    });

}

function getCSRFToken() {
    const token = document.querySelector('[name=csrfmiddlewaretoken]');
    return token ? token.value : "";
}

// Optional auto refresh (every 10 sec)
// setInterval(() => {
//     fetch(window.location.href)
//         .then(res => res.text())
//         .then(html => {
//             const temp = document.createElement("div");
//             temp.innerHTML = html;
//             document.getElementById("orderList").innerHTML =
//                 temp.querySelector("#orderList").innerHTML;
//         });
// }, 2000);
