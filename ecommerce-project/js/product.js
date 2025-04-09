// Sample product data (in a real app, this would come from an API)
const products = [
    {
        id: 1,
        name: 'Steinway & Sons Model D Concert Grand Piano',
        price: 175000.00,
        image: 'https://images.pexels.com/photos/164743/pexels-photo-164743.jpeg',
        description: 'The pinnacle of concert grand pianos, featuring rich tone and unparalleled craftsmanship. Perfect for concert halls and professional pianists.'
    },
    {
        id: 2,
        name: 'Yamaha U3 Professional Upright Piano',
        price: 12999.99,
        image: 'https://images.pexels.com/photos/159420/piano-instrument-music-keys-159420.jpeg',
        description: 'Professional-grade upright piano with exceptional sound quality and reliable performance. Ideal for serious musicians and music schools.'
    },
    {
        id: 3,
        name: 'Roland RD-88 Digital Stage Piano',
        price: 1299.99,
        image: 'https://images.pexels.com/photos/1246437/pexels-photo-1246437.jpeg',
        description: 'Premium digital piano with weighted keys and authentic grand piano sound. Perfect for performers and home studios.'
    },
    {
        id: 4,
        name: 'Bösendorfer 200CS Grand Piano',
        price: 98500.00,
        image: 'https://images.pexels.com/photos/45243/grand-piano-piano-music-instrument-45243.jpeg',
        description: 'Handcrafted in Vienna, featuring the distinctive Bösendorfer sound with rich bass and singing treble.'
    },
    {
        id: 5,
        name: 'Kawai K-500 Professional Upright Piano',
        price: 15999.99,
        image: 'https://images.pexels.com/photos/1021142/pexels-photo-1021142.jpeg',
        description: 'Professional upright piano with superior touch and tone. Features Kawai\'s renowned build quality and reliability.'
    },
    {
        id: 6,
        name: 'Nord Piano 5 Digital Piano',
        price: 3499.99,
        image: 'https://images.pexels.com/photos/164935/pexels-photo-164935.jpeg',
        description: 'High-end digital piano with premium piano samples and advanced features. Perfect for professional musicians and studios.'
    }
];

// Cart functionality
class Cart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(productId) {
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
            this.showNotification('Product added to cart!');
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
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 translate-y-0 opacity-100';
        notification.textContent = message;

        // Add to document
        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.classList.add('translate-y-[-1rem]', 'opacity-0');
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Initialize cart
const cart = new Cart();

// Render products
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('products');
    if (!container) return;

    products.forEach(product => {
        const productEl = document.createElement('div');
        productEl.className = 'bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:transform hover:scale-105';
        productEl.innerHTML = `
            <div class="cursor-pointer" onclick="window.location.href='product-detail.html?id=${product.id}'">
                <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-gray-900">${product.name}</h3>
                    <p class="text-gray-600 mt-2">${product.description}</p>
                    <div class="mt-4 flex items-center justify-between">
                        <span class="text-xl font-bold text-blue-600">$${product.price.toFixed(2)}</span>
                        <button 
                            onclick="event.stopPropagation(); cart.addItem(${product.id})"
                            class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(productEl);
    });
});