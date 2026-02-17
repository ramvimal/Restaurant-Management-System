document.addEventListener('DOMContentLoaded', () => {
    const cardName = document.getElementById('cardName');
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvv = document.getElementById('cardCvv');
    const payBtn = document.getElementById('payBtn');
    const paymentForm = document.getElementById('paymentForm');

    // Visual Elements
    const visualNumber = document.getElementById('visual-number');
    const visualName = document.getElementById('visual-name');
    const visualExpiry = document.getElementById('visual-expiry');
    const visualCvv = document.getElementById('visual-cvv');
    const creditCard = document.getElementById('creditCard');

    // Input Event Listeners for Real-time Updates
    cardName.addEventListener('input', (e) => {
        visualName.textContent = e.target.value.toUpperCase() || 'FULL NAME';
    });

    cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
        value = value.substring(0, 16); // Limit to 16 digits
        // Add space every 4 digits
        const formattedValue = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = formattedValue;
        visualNumber.textContent = formattedValue || '#### #### #### ####';
    });

    cardExpiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value;
        visualExpiry.textContent = value || 'MM/YY';
    });

    cardCvv.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.substring(0, 3);
        e.target.value = value;
        visualCvv.textContent = value || '***';
    });

    // Flip Animation on CVV Focus
    cardCvv.addEventListener('focus', () => {
        creditCard.classList.add('flipped');
    });

    cardCvv.addEventListener('blur', () => {
        creditCard.classList.remove('flipped');
    });

    // --- Payment Method Toggle Logic ---
    const methodBtns = document.querySelectorAll('.method-btn');
    const sections = {
        'card': document.getElementById('method-card'),
        'cash': document.getElementById('method-cash')
    };

    methodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            methodBtns.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Hide all sections
            Object.values(sections).forEach(sec => sec.classList.add('hidden-section'));

            // Show selected section
            const method = btn.getAttribute('data-method');
            sections[method].classList.remove('hidden-section');
        });
    });

    // --- Cash Payment Logic ---
    const confirmCashBtn = document.getElementById('confirmCashBtn');
    if (confirmCashBtn) {
        confirmCashBtn.addEventListener('click', () => {
            // Hide Cash Section
            sections['cash'].classList.add('hidden-section');
            document.querySelector('.payment-methods').classList.add('hidden'); // Hide toggle too

            // Show Processing
            const processing = document.getElementById('processing');
            processing.classList.remove('hidden');

            // Simulate API delay
            setTimeout(() => {
                // Processing -> Success
                processing.classList.add('hidden');
                const success = document.getElementById('success');
                success.classList.remove('hidden');

                // Trigger Backend Success URL
                if (typeof ORDER_ID !== 'undefined') {
                    // Send payment_mode='CASH'
                    fetch(`/payment/success/${ORDER_ID}/?mode=CASH`)
                        .then(res => res.json())
                        .then(data => {
                            console.log('Cash Payment recorded:', data);
                            setTimeout(() => {
                                window.location.href = `/order-confirmed/${ORDER_ID}/`;
                            }, 2000);
                        })
                        .catch(err => {
                            console.error('Error:', err);
                            alert('Something went wrong. Redirecting to home...');
                            window.location.href = '/';
                        });
                } else {
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                }
            }, 2000);
        });
    }

    // Payment Logic (Card)
    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Hide Form
        paymentForm.classList.add('hidden');
        document.querySelector('.card-visual-container').classList.add('hidden');
        document.querySelector('.payment-methods').classList.add('hidden'); // Hide toggle

        // Show Processing
        const processing = document.getElementById('processing');
        processing.classList.remove('hidden');

        // Simulate API delay
        setTimeout(() => {
            // Processing -> Success
            processing.classList.add('hidden');
            const success = document.getElementById('success');
            success.classList.remove('hidden');

            // Trigger Backend Success URL
            if (typeof ORDER_ID !== 'undefined') {
                // Send payment_mode='CARD'
                fetch(`/payment/success/${ORDER_ID}/?mode=CARD`)
                    .then(res => res.json())
                    .then(data => {
                        console.log('Payment recorded:', data);
                        setTimeout(() => {
                            window.location.href = `/order-confirmed/${ORDER_ID}/`;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Error:', err);
                        alert('Something went wrong. Redirecting to home...');
                        window.location.href = '/';
                    });
            } else {
                console.error("Order ID not found");
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);
            }

        }, 2000);
    });
});
