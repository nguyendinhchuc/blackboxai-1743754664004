
// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(productId, products) {
        const product = products.find(p => p.id === productId);
        if (product) {
            const existingItem = this.items.find(item => item.id === productId);
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                this.items.push({ ...product, quantity: 1 });
            }
            this.saveCart();
            this.updateCartCount();
            this.showNotification('Đã thêm sản phẩm vào giỏ hàng!');
        }
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartCount();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = count;
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-y-0 opacity-100 z-50';
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => {
            notification.classList.add('translate-y-[-1rem]', 'opacity-0');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Initialize cart
const cart = new Cart();

// Function to render products
const renderProducts = (products) => {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = ''; // Clear existing content

    products.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105';
        productEl.innerHTML = `
            <div class="cursor-pointer" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <img src="${product.image || 'https://images.pexels.com/photos/210020/pexels-photo-210020.jpeg'}" 
                     alt="${product.name}" 
                     class="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-300"
                     onerror="this.src='https://images.pexels.com/photos/210020/pexels-photo-210020.jpeg'">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors duration-300">${product.name}</h3>
                    <p class="text-gray-600 mt-2">${product.description}</p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xl font-bold text-blue-600">${product.price.toLocaleString('vi-VN')} đ</span>
                        <button 
                            onclick="event.stopPropagation(); cart.addItem(${product.id}, ${JSON.stringify(products).replace(/"/g, '"')})"
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
                        >
                            Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productEl);
    });
};

// Function to show loading spinner
const showLoading = () => {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = `
        <div class="flex justify-center items-center w-full py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    `;
};

// Function to show error message with retry button
const showError = (message, retryCallback) => {
    const container = document.getElementById('products');
    if (!container) return;

    container.innerHTML = `
        <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
            <div class="flex flex-col items-center">
                <strong class="font-bold mb-2">Lỗi!</strong>
                <span class="block sm:inline mb-4">${message}</span>
                <button 
                    onclick="${retryCallback}"
                    class="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-300"
                >
                    Thử lại
                </button>
            </div>
        </div>
    `;
};
// Function to load all products (for products.html)
const loadAllProducts = async () => {
    showLoading();
     fetch(`${API_BASE_URL}/products/search`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json' // Thêm Content-Type nếu cần
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            renderProducts(data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
};

// Initialize products when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    const isProductsPage = window.location.pathname.includes('products.html');
    loadAllProducts();
});
