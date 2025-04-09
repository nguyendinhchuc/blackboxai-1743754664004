class CheckoutPage {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.renderOrderItems();
        this.updateOrderSummary();
        this.setupFormValidation();
        this.setupPaymentToggle();
    }

    renderOrderItems() {
        const orderItems = document.getElementById('order-items');
        
        orderItems.innerHTML = this.cart.map(item => `
            <div class="flex items-center gap-4 border-b pb-4">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded">
                <div class="flex-1">
                    <h3 class="text-sm font-medium text-gray-900">${item.name}</h3>
                    <p class="text-sm text-gray-500">Quantity: ${item.quantity}</p>
                    <div class="mt-1 text-xs text-gray-500">
                        <p><i class="fas fa-truck mr-1"></i> White Glove Delivery</p>
                        <p><i class="fas fa-tools mr-1"></i> Professional Setup</p>
                    </div>
                </div>
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-900">${this.formatCurrency(item.price * item.quantity)}</p>
                </div>
            </div>
        `).join('');
    }

    updateOrderSummary() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('total').textContent = this.formatCurrency(subtotal);

        // Update financing information if available
        const monthlyPayment = subtotal / 12;
        const financeLabel = document.querySelector('label[for="payment-finance"] p');
        if (financeLabel) {
            financeLabel.textContent = `12 monthly payments of ${this.formatCurrency(monthlyPayment)}`;
        }
    }

    setupFormValidation() {
        const form = document.getElementById('checkout-form');
        const cardNumberInput = form.querySelector('input[placeholder="**** **** **** ****"]');
        const expirationInput = form.querySelector('input[placeholder="MM/YY"]');
        const cvvInput = form.querySelector('input[placeholder="***"]');

        // Card number formatting
        cardNumberInput?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})/g, '$1 ').trim();
            e.target.value = value.substring(0, 19);
        });

        // Expiration date formatting
        expirationInput?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2);
            }
            e.target.value = value.substring(0, 5);
        });

        // CVV formatting
        cvvInput?.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.substring(0, 3);
        });
    }

    setupPaymentToggle() {
        const paymentDetails = document.getElementById('payment-details');
        const paymentRadios = document.querySelectorAll('input[name="payment"]');

        paymentRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.id === 'payment-full') {
                    paymentDetails.style.display = 'block';
                } else {
                    paymentDetails.style.display = 'none';
                    this.showFinancingModal();
                }
            });
        });
    }

    showFinancingModal() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const monthlyPayment = subtotal / 12;

        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
                <h2 class="text-2xl font-bold mb-4">Piano Financing Application</h2>
                <div class="space-y-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <p class="font-medium text-blue-900">Estimated Monthly Payment:</p>
                        <p class="text-2xl font-bold text-blue-600">${this.formatCurrency(monthlyPayment)}</p>
                        <p class="text-sm text-blue-800">for 12 months at 0% APR</p>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Annual Income</label>
                        <input type="text" class="w-full px-4 py-2 border rounded-lg" placeholder="$">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Employment Status</label>
                        <select class="w-full px-4 py-2 border rounded-lg">
                            <option value="">Select...</option>
                            <option>Full-time</option>
                            <option>Part-time</option>
                            <option>Self-employed</option>
                            <option>Retired</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Years at Current Address</label>
                        <input type="number" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-4">
                    <button onclick="this.closest('.fixed').remove(); document.getElementById('payment-full').checked = true;"
                        class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button onclick="checkoutPage.submitFinancingApplication()"
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Apply for Financing
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    submitFinancingApplication() {
        this.showNotification('Processing your financing application...');
        setTimeout(() => {
            this.showNotification('Financing approved! Proceeding with checkout.');
            document.querySelector('.fixed').remove();
            document.getElementById('payment-details').style.display = 'none';
        }, 2000);
    }

    validateForm() {
        const form = document.getElementById('checkout-form');
        const inputs = form.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('border-red-500');
            } else {
                input.classList.remove('border-red-500');
            }
        });

        return isValid;
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ${
            isError ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('opacity-0');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }

    scheduleDelivery() {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
                <h2 class="text-2xl font-bold mb-4">Schedule Piano Delivery</h2>
                <div class="space-y-4">
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Preferred Delivery Date</label>
                        <input type="date" class="w-full px-4 py-2 border rounded-lg" min="${new Date().toISOString().split('T')[0]}">
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Preferred Time Window</label>
                        <select class="w-full px-4 py-2 border rounded-lg">
                            <option>Morning (9AM - 12PM)</option>
                            <option>Afternoon (12PM - 4PM)</option>
                            <option>Evening (4PM - 7PM)</option>
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label class="block text-sm font-medium text-gray-700">Delivery Notes</label>
                        <textarea class="w-full px-4 py-2 border rounded-lg" rows="3" 
                            placeholder="Any special instructions for delivery (e.g., elevator access, stairs, etc.)"></textarea>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-4">
                    <button onclick="this.closest('.fixed').remove()"
                        class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button onclick="checkoutPage.confirmDeliverySchedule()"
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Confirm Schedule
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    confirmDeliverySchedule() {
        this.showNotification('Delivery schedule confirmed!');
        document.querySelector('.fixed').remove();
    }
}

async function placeOrder() {
    const checkoutPage = window.checkoutPage;
    
    if (!checkoutPage.validateForm()) {
        checkoutPage.showNotification('Please fill in all required fields', true);
        return;
    }

    try {
        const orderData = {
            items: checkoutPage.cart,
            shippingAddress: {
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                postalCode: document.getElementById('postalCode').value
            },
            paymentMethod: document.querySelector('input[name="payment"]:checked').value
        };

        const response = await apiRequest(`${window.API_BASE_URL}/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('Failed to place order');
        }

        // Clear cart after successful order
        localStorage.removeItem('cart');
        
        // Show success message and redirect
        checkoutPage.showNotification('Order placed successfully!');
        setTimeout(() => {
            window.location.href = '/confirmation.html';
        }, 2000);

    } catch (error) {
        console.error('Error placing order:', error);
        checkoutPage.showNotification('Failed to place order. Please try again.', true);
    }
}

// Initialize checkout page
window.checkoutPage = new CheckoutPage();