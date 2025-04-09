// Product Management Functions
const ProductManager = {
    async loadProducts() {
        await fetch(`${AUTH_API_URL}/products/search`, {
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
    },
    async uploadImage(file, productId) {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`${AUTH_API_URL}/products/${productId}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: formData
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data.imageUrl;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    },

    async saveProduct(product) {
        try {
            const response = await fetch(`${AUTH_API_URL}/products/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(product)
            });
            return await response.json();
        } catch (error) {
            console.error('Error saving product:', error);
            throw error;
        }
    },

    async deleteProduct(productId) {
        try {
            await fetch(`${AUTH_API_URL}/products/${productId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            return true;
        } catch (error) {
            console.error('Error deleting product:', error);
            return false;
        }
    }
};

// Initialize product management
document.addEventListener('DOMContentLoaded', async () => {
    if (!document.getElementById('productManager')) return;

    // Image preview functionality
    const imageInput = document.getElementById('productImage');
    const imagePreview = document.getElementById('imagePreview');

    imageInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            e.target.value = '';
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should not exceed 2MB');
            e.target.value = '';
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Form submission
    const productForm = document.getElementById('productForm');
    productForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = productForm.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
        try {
            let product = {
                id: document.getElementById('productId').value || null,
                name: document.getElementById('productName').value,
                price: parseFloat(document.getElementById('productPrice').value),
                stockQuantity: parseInt(document.getElementById('productStock').value),
                description: document.getElementById('productDescription').value,
                imageUrl: imagePreview.src
            };

            const imageFile = imageInput.files[0];

            // Show loading state
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;

            // First save the product to get an ID if it's new
            let savedProduct = await ProductManager.saveProduct(product);

            // Then handle image upload if there's a new file
            if (imageFile) {
                await ProductManager.uploadImage(imageFile, savedProduct.id);
                savedProduct.imageUrl = imageUrl;
                savedProduct = await ProductManager.saveProduct(savedProduct);
            }

            // Refresh product list
            await ProductManager.loadProducts();

            // Close modal and reset form
            document.getElementById('productModal').classList.add('hidden');
            productForm.reset();
            // imagePreview.src = 'https://via.placeholder.com/100';

            // Show success message
            showToast('Sản phẩm đã được lưu thành công', 'success');
        } catch (error) {
            showToast(error.message || 'Có lỗi xảy ra khi lưu sản phẩm', 'error');
        } finally {
            // Reset button state
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Lưu";
        }
    });

    // Load initial products
    await ProductManager.loadProducts();
});

// Helper function to show toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-lg text-white ${
        type === 'error' ? 'bg-red-500' : 
        type === 'success' ? 'bg-green-500' : 'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Render products in table
function renderProducts(products) {
    debugger
    const tableBody = document.getElementById('productTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = products.map(product => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">${product.id}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${product.imageUrl || 'https://via.placeholder.com/50'}" alt="${product.name}" 
                    class="h-10 w-10 rounded-full object-cover">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <a href="../product-detail.html?id=${product.id}" class="text-indigo-600 hover:text-indigo-900">
                    ${product.name}
                </a>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">${product.price.toLocaleString('vi-VN')}₫</td>
            <td class="px-6 py-4 whitespace-nowrap">${product.stockQuantity}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }">
                    ${product.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="editProduct(${product.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-600 hover:text-red-900" onclick="deleteProduct(${product.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit product function
async function editProduct(productId) {
    try {
        const response = await fetch(`${AUTH_API_URL}/products/${productId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const product = await response.json();

        // Fill form with product data
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stockQuantity;
        document.getElementById('productDescription').value = product.description;
        document.getElementById('imagePreview').src = product.imageUrl || 'https://via.placeholder.com/100';

        // Update modal title and show
        document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Sản Phẩm';
        document.getElementById('productModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading product:', error);
        showToast('Có lỗi xảy ra khi tải thông tin sản phẩm', 'error');
    }
}

// Delete product function
async function deleteProduct(productId) {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;

    try {
        await ProductManager.deleteProduct(productId);

        // Refresh product list
        await ProductManager.loadProducts();

        showToast('Sản phẩm đã được xóa thành công', 'success');
    } catch (error) {
        showToast('Có lỗi xảy ra khi xóa sản phẩm', 'error');
    }
}