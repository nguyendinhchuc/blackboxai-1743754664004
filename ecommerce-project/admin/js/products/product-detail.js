// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

// Elements
const productForm = document.getElementById('productForm');
const productImage = document.getElementById('productImage');
const imageInput = document.getElementById('imageInput');
const saveButton = document.getElementById('saveButton');
const deleteButton = document.getElementById('deleteButton');

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg text-white transform transition-transform duration-300 ${
        type === 'success' ? 'bg-green-600' : 'bg-red-600'
    }`;
    toast.style.transform = 'translateY(0)';
    setTimeout(() => {
        toast.style.transform = 'translateY(100%)';
    }, 3000);
}

// Load product details
async function loadProductDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product details');

        const product = await response.json();

        // Populate form fields
        document.getElementById('productName').value = product.name || '';
        document.getElementById('productPrice').value = product.price || '';
        document.getElementById('productStock').value = product.stockQuantity || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategory').value = product.category || 'electronics';
        document.getElementById('productSKU').value = product.sku || '';
        document.getElementById('productStatus').value = product.status || 'active';

        // Set product image
        if (product.imageUrl) {
            productImage.src = product.imageUrl;
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Không thể tải thông tin sản phẩm', 'error');
    }
}

// Handle image upload
imageInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Upload failed');

        const { imageUrl } = await response.json();
        productImage.src = imageUrl;
        showToast('Tải ảnh lên thành công');
    } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Không thể tải ảnh lên', 'error');
    }
});

// Save product changes
saveButton.addEventListener('click', async () => {
    try {
        const productData = {
            name: document.getElementById('productName').value,
            price: parseFloat(document.getElementById('productPrice').value),
            stockQuantity: parseInt(document.getElementById('productStock').value),
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            sku: document.getElementById('productSKU').value,
            status: document.getElementById('productStatus').value,
            imageUrl: productImage.src
        };

        const response = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(productData)
        });

        if (!response.ok) throw new Error('Update failed');

        showToast('Lưu thay đổi thành công');
    } catch (error) {
        console.error('Error saving product:', error);
        showToast('Không thể lưu thay đổi', 'error');
    }
});

// Delete product
deleteButton.addEventListener('click', async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
        const response = await fetch(`/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Delete failed');

        showToast('Xóa sản phẩm thành công');
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);
    } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Không thể xóa sản phẩm', 'error');
    }
});

// Form validation
function validateForm() {
    const name = document.getElementById('productName').value;
    const price = document.getElementById('productPrice').value;
    const stock = document.getElementById('productStock').value;

    if (!name || !price || !stock) {
        showToast('Vui lòng điền đầy đủ thông tin bắt buộc', 'error');
        return false;
    }

    if (price < 0) {
        showToast('Giá không thể là số âm', 'error');
        return false;
    }

    if (stock < 0) {
        showToast('Số lượng không thể là số âm', 'error');
        return false;
    }

    return true;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!productId) {
        showToast('Không tìm thấy ID sản phẩm', 'error');
        return;
    }
    loadProductDetails();
});