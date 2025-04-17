// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
let products = {};

// Product detail functions
const ProductDetail = {
    // loadRelatedProducts() {
    //     // Get all products except the current one
    //     return products.filter(p => p.id !== parseInt(productId)).slice(0, 4);
    // },

    updateUI(product) {
        // Update page title
        document.title = `${product.name} - Shop`;

        // Update breadcrumb
        document.getElementById('productName').textContent = product.name;

        // Update product details
        document.getElementById('productTitle').textContent = product.name;
        document.getElementById('productPrice').textContent = `${product.price.toLocaleString('vi-VN')}₫`;
        document.getElementById('stockStatus').textContent = product.stock > 0 ? 'Còn hàng' : 'Hết hàng';
        document.getElementById('stockStatus').className = `font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`;
        document.getElementById('productDescription').textContent = product.description;
        document.getElementById('additionalInfo').textContent = product.additionalInfo || 'Không có thông tin thêm';

        // Update main image
        const mainImage = document.getElementById('mainImage');
        mainImage.src = product.imageUrl || 'https://via.placeholder.com/600';
        mainImage.alt = product.name;

        // Update image gallery if there are additional images
        if (product.images && product.images.length > 0) {
            const gallery = document.getElementById('imageGallery');
            gallery.innerHTML = product.images.map(image => `
                <button class="relative h-24 bg-white rounded-md flex items-center justify-center hover:border-indigo-600 focus:outline-none focus:ring focus:ring-offset-4 focus:ring-indigo-500">
                    <img src="${image}" alt="" class="w-full h-full object-center object-cover rounded-md">
                </button>
            `).join('');

            // Add click handlers for gallery images
            gallery.querySelectorAll('button').forEach((button, index) => {
                button.addEventListener('click', () => {
                    mainImage.src = product.images[index];
                });
            });
        }

        // Enable/disable add to cart button based on stock
        const addToCartBtn = document.querySelector('button[onclick="addToCart()"]');
        if (product.stock <= 0) {
            addToCartBtn.disabled = true;
            addToCartBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }

        // Update quantity input max value
        document.getElementById('quantity').max = product.stock;
    },

    renderRelatedProducts(products) {
        const container = document.getElementById('relatedProducts');
        container.innerHTML = products.map(product => `
            <div class="group relative">
                <div class="w-full min-h-80 bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                    <img src="${product.imageUrl}" 
                         alt="${product.name}"
                         class="w-full h-full object-center object-cover">
                </div>
                <div class="mt-4 flex justify-between">
                    <div>
                        <h3 class="text-sm text-gray-700">
                            <a href="product-detail.html?id=${product.id}">
                                ${product.name}
                            </a>
                        </h3>
                    </div>
                    <p class="text-sm font-medium text-gray-900">${product.price.toLocaleString('vi-VN')}₫</p>
                </div>
            </div>
        `).join('');
    }
};

// Quantity update function
function updateQuantity(change) {
    const input = document.getElementById('quantity');
    const newValue = parseInt(input.value) + change;
    if (newValue >= parseInt(input.min) && newValue <= parseInt(input.max)) {
        input.value = newValue;
    }
}

// Add to cart function
async function addToCart() {
    try {
        const quantity = parseInt(document.getElementById('quantity').value);

        const response = await apiRequest(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            body: JSON.stringify({
                productId,
                quantity
            })
        });

        if (!response.ok) throw new Error('Failed to add to cart');

        showToast('Đã thêm vào giỏ hàng', 'success');
        updateCartCount();
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToast('Có lỗi xảy ra khi thêm vào giỏ hàng', 'error');
    }
}

// Add to wishlist function
async function addToWishlist() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/wishlist/add`, {
            method: 'POST',
            body: JSON.stringify({ productId })
        });

        if (!response.ok) throw new Error('Failed to add to wishlist');

        showToast('Đã thêm vào danh sách yêu thích', 'success');
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showToast('Có lỗi xảy ra khi thêm vào danh sách yêu thích', 'error');
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const response = await apiRequest(`${API_BASE_URL}/cart/count`);
        const data = await response.json();
        document.getElementById('cartCount').textContent = data.count;
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' :
            type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    toast.classList.remove('translate-x-full');

    setTimeout(() => {
        toast.classList.add('translate-x-full');
    }, 3000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', async () => {
    if (!productId) {
        window.location.href = 'products.html';
        return;
    }

    try {
        products = await loadProductDetails();

        if (!products) {
            window.location.href = 'products.html';
            return;
        }

        ProductDetail.updateUI(products);

        // const relatedProducts = ProductDetail.loadRelatedProducts();
        // ProductDetail.renderRelatedProducts(relatedProducts);

        // Initialize cart count from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }
    } catch (error) {
        console.error('Error initializing product page:', error);
        showToast('Có lỗi xảy ra khi tải trang', 'error');
        window.location.href = 'products.html';
    }
});

// Load product details
async function loadProductDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product details');
        return await response.json();
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
        return null;
    }
}
