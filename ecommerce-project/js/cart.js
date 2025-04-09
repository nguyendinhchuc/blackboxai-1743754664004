class CartPage {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.renderCart();
        this.updateOrderSummary();
    }

    updateCartCount() {
        const count = this.cart.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }

    renderCart() {
        const cartItems = document.getElementById('cart-items');
        const emptyCart = document.getElementById('empty-cart');

        if (this.cart.length === 0) {
            cartItems.innerHTML = '';
            emptyCart.classList.remove('hidden');
            return;
        }

        emptyCart.classList.add('hidden');
        cartItems.innerHTML = this.cart.map(item => `
            <div class="bg-white rounded-lg shadow-md p-6">
                <div class="flex items-center gap-6">
                    <img src="${item.image}" alt="${item.name}" class="w-32 h-32 object-cover rounded">
                    <div class="flex-1">
                        <h3 class="text-xl font-semibold text-gray-900">${item.name}</h3>
                        <p class="text-gray-600 mt-1">${item.description}</p>
                        <div class="mt-4 flex items-center gap-4">
                            <div class="flex items-center border rounded">
                                <button 
                                    onclick="cartPage.updateQuantity(${item.id}, ${item.quantity - 1})"
                                    class="px-3 py-1 hover:bg-gray-100"
                                    ${item.quantity <= 1 ? 'disabled' : ''}
                                >
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="px-3 py-1 border-x">${item.quantity}</span>
                                <button 
                                    onclick="cartPage.updateQuantity(${item.id}, ${item.quantity + 1})"
                                    class="px-3 py-1 hover:bg-gray-100"
                                >
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                            <button 
                                onclick="cartPage.removeItem(${item.id})"
                                class="text-red-600 hover:text-red-700"
                            >
                                <i class="fas fa-trash"></i> Remove
                            </button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-2xl font-semibold text-blue-600">
                            ${this.formatCurrency(item.price * item.quantity)}
                        </p>
                        <p class="text-sm text-gray-600 mt-1">
                            ${this.formatCurrency(item.price)} each
                        </p>
                    </div>
                </div>
                <div class="mt-4 pt-4 border-t">
                    <div class="flex items-center justify-between text-sm text-gray-600">
                        <div>
                            <p><i class="fas fa-truck mr-2"></i> White Glove Delivery Included</p>
                            <p><i class="fas fa-tools mr-2"></i> Professional Setup Included</p>
                            <p><i class="fas fa-music mr-2"></i> First Tuning Service Included</p>
                        </div>
                        <button 
                            onclick="cartPage.showPianoDetails(${item.id})"
                            class="text-blue-600 hover:text-blue-700"
                        >
                            View Piano Details
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateOrderSummary() {
        const subtotal = this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('total').textContent = this.formatCurrency(subtotal);
    }

    async updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) return;

        try {
            const response = await apiRequest(`${window.API_BASE_URL}/cart/update`, {
                method: 'PUT',
                body: JSON.stringify({
                    productId,
                    quantity: newQuantity
                })
            });

            if (!response.ok) throw new Error('Failed to update cart');

            const item = this.cart.find(item => item.id === productId);
            if (item) {
                item.quantity = newQuantity;
                this.saveCart();
                this.init();
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            showNotification('Failed to update cart. Please try again.', 'error');
        }
    }

    async removeItem(productId) {
        try {
            const response = await apiRequest(`${window.API_BASE_URL}/cart/remove/${productId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to remove item');

            this.cart = this.cart.filter(item => item.id !== productId);
            this.saveCart();
            this.init();
        } catch (error) {
            console.error('Error removing item:', error);
            showNotification('Failed to remove item. Please try again.', 'error');
        }
    }

    async saveCart() {
        try {
            const response = await apiRequest(`${window.API_BASE_URL}/cart/sync`, {
                method: 'POST',
                body: JSON.stringify(this.cart)
            });

            if (response.ok) {
                localStorage.setItem('cart', JSON.stringify(this.cart));
            }
        } catch (error) {
            console.error('Error syncing cart:', error);
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount);
    }

    showPianoDetails(productId) {
        window.location.href = `/product-detail.html?id=${productId}`;
    }
}

// Additional functions for piano-specific features
function scheduleConsultation() {
    // Show consultation scheduling modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 class="text-2xl font-bold mb-4">Schedule a Consultation</h2>
            <p class="text-gray-600 mb-6">
                Speak with our piano experts to discuss your selection and get personalized recommendations.
            </p>
            <form id="consultationForm" class="space-y-4">
                <div>
                    <label class="block text-gray-700 mb-2">Preferred Date</label>
                    <input type="date" class="w-full border rounded-lg px-4 py-2" required>
                </div>
                <div>
                    <label class="block text-gray-700 mb-2">Preferred Time</label>
                    <select class="w-full border rounded-lg px-4 py-2" required>
                        <option value="">Select a time</option>
                        <option>Morning (9AM - 12PM)</option>
                        <option>Afternoon (12PM - 4PM)</option>
                        <option>Evening (4PM - 7PM)</option>
                    </select>
                </div>
                <div class="flex justify-end space-x-4">
                    <button type="button" onclick="this.closest('.fixed').remove()" 
                        class="px-4 py-2 text-gray-600 hover:text-gray-800">
                        Cancel
                    </button>
                    <button type="submit" 
                        class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        Schedule
                    </button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('consultationForm').onsubmit = (e) => {
        e.preventDefault();
        modal.remove();
        showNotification('Consultation request submitted! We\'ll contact you shortly.');
    };
}

function exploreFinancing() {
    // Show financing options modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-lg p-8 max-w-lg w-full mx-4">
            <h2 class="text-2xl font-bold mb-4">Piano Financing Options</h2>
            <div class="space-y-6">
                <div class="border-b pb-4">
                    <h3 class="text-lg font-semibold mb-2">0% APR for 12 Months</h3>
                    <p class="text-gray-600">Make your dream piano yours today with no interest for a full year.</p>
                </div>
                <div class="border-b pb-4">
                    <h3 class="text-lg font-semibold mb-2">Extended Payment Plans</h3>
                    <p class="text-gray-600">Flexible payment terms up to 84 months with competitive rates.</p>
                </div>
                <div class="border-b pb-4">
                    <h3 class="text-lg font-semibold mb-2">Rent-to-Own Program</h3>
                    <p class="text-gray-600">Start with a rental and apply payments toward ownership.</p>
                </div>
            </div>
            <div class="mt-6 flex justify-end">
                <button onclick="this.closest('.fixed').remove()" 
                    class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Close
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function proceedToCheckout() {
    window.location.href = '/checkout.html';
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

// Initialize cart page
const cartPage = new CartPage();