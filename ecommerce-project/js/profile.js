// Profile management functionality
const profileAPI = `${window.API_BASE_URL}/profile`;

// Initialize profile page
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    loadUserProfile();
    setupTabNavigation();
    loadProvinces();
    setupFormHandlers();
});

// Check if user is authenticated
function checkAuthentication() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!token) {
        window.location.href = 'signin.html';
        return;
    }
}

// Load user profile data
async function loadUserProfile() {
    try {
        showLoading(true);
        const response = await apiRequest(profileAPI);

        if (response.ok) {
            const profile = await response.json();
            populateProfileForm(profile);
            loadOrders();
            loadWishlist();
        } else {
            showToast('Không thể tải thông tin tài khoản', 'error');
        }
    } catch (error) {
        console.error('Load profile error:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        showLoading(false);
    }
}

// Populate profile form with user data
function populateProfileForm(profile) {
    document.getElementById('firstName').value = profile.firstName || '';
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('address').value = profile.address || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('province').value = profile.province || '';
    document.getElementById('postalCode').value = profile.postalCode || '';
}

// Setup tab navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update tab styles
            tabs.forEach(t => t.classList.remove('border-indigo-500', 'text-indigo-600'));
            tabs.forEach(t => t.classList.add('border-transparent', 'text-gray-500'));
            tab.classList.remove('border-transparent', 'text-gray-500');
            tab.classList.add('border-indigo-500', 'text-indigo-600');

            // Show corresponding content
            const targetId = tab.getAttribute('href').substring(1) + 'Tab';
            contents.forEach(content => content.classList.add('hidden'));
            document.getElementById(targetId).classList.remove('hidden');
        });
    });
}

// Load provinces for dropdown
async function loadProvinces() {
    try {
        const response = await apiRequest(`${window.API_BASE_URL}/provinces`);
        const provinces = await response.json();
        
        const select = document.getElementById('province');
        select.innerHTML = '<option value="">Chọn Tỉnh/Thành Phố</option>' +
            provinces.map(province => 
                `<option value="${province.code}">${province.name}</option>`
            ).join('');
    } catch (error) {
        console.error('Load provinces error:', error);
    }
}

// Setup form handlers
function setupFormHandlers() {
    const profileForm = document.getElementById('profileForm');
    
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Validate password change if attempted
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword && newPassword !== confirmPassword) {
            showToast('Mật khẩu mới không khớp', 'error');
            return;
        }

        try {
            showLoading(true);
            const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            
            const formData = {
                firstName: document.getElementById('firstName').value,
                lastName: document.getElementById('lastName').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                city: document.getElementById('city').value,
                province: document.getElementById('province').value,
                postalCode: document.getElementById('postalCode').value
            };

            // Add password change data if provided
            const currentPassword = document.getElementById('currentPassword').value;
            if (currentPassword && newPassword) {
                formData.currentPassword = currentPassword;
                formData.newPassword = newPassword;
            }

            const response = await apiRequest(profileAPI, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Cập nhật thông tin thành công', 'success');
                // Clear password fields
                document.getElementById('currentPassword').value = '';
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            } else {
                const data = await response.json();
                showToast(data.message || 'Cập nhật thông tin thất bại', 'error');
            }
        } catch (error) {
            console.error('Update profile error:', error);
            showToast('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
        } finally {
            showLoading(false);
        }
    });
}

// Load orders
async function loadOrders() {
    try {
        const response = await apiRequest(`${window.API_BASE_URL}/orders`);

        if (response.ok) {
            const orders = await response.json();
            const ordersTab = document.getElementById('ordersTab');
            
            if (orders.length === 0) {
                ordersTab.innerHTML = `
                    <div class="text-center py-8">
                        <i class="fas fa-shopping-bag text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">Bạn chưa có đơn hàng nào</p>
                        <a href="products.html" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
                            Mua Sắm Ngay
                        </a>
                    </div>
                `;
                return;
            }

            ordersTab.innerHTML = orders.map(order => `
                <div class="bg-white border rounded-lg overflow-hidden">
                    <div class="px-6 py-4 border-b bg-gray-50">
                        <div class="flex justify-between items-center">
                            <div>
                                <p class="text-sm text-gray-600">Đơn hàng #${order.id}</p>
                                <p class="text-sm text-gray-600">${new Date(order.date).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <div class="text-right">
                                <p class="text-lg font-semibold">${formatPrice(order.total)}₫</p>
                                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                      'bg-gray-100 text-gray-800'}">
                                    ${translateOrderStatus(order.status)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="px-6 py-4">
                        ${order.items.map(item => `
                            <div class="flex items-center py-2">
                                <img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 object-cover rounded">
                                <div class="ml-4 flex-1">
                                    <h4 class="text-sm font-medium">${item.name}</h4>
                                    <p class="text-sm text-gray-500">
                                        ${formatPrice(item.price)}₫ x ${item.quantity}
                                    </p>
                                </div>
                                <p class="text-sm font-medium">
                                    ${formatPrice(item.price * item.quantity)}₫
                                </p>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load orders error:', error);
    }
}

// Load wishlist
async function loadWishlist() {
    try {
        const response = await apiRequest(`${window.API_BASE_URL}/wishlist`);

        if (response.ok) {
            const wishlist = await response.json();
            const wishlistTab = document.getElementById('wishlistTab');
            
            if (wishlist.length === 0) {
                wishlistTab.innerHTML = `
                    <div class="text-center py-8 col-span-full">
                        <i class="fas fa-heart text-gray-300 text-5xl mb-4"></i>
                        <p class="text-gray-500">Danh sách yêu thích trống</p>
                        <a href="products.html" class="text-indigo-600 hover:text-indigo-800 mt-2 inline-block">
                            Khám Phá Sản Phẩm
                        </a>
                    </div>
                `;
                return;
            }

            wishlistTab.innerHTML = wishlist.map(product => `
                <div class="bg-white rounded-lg shadow-md overflow-hidden group">
                    <div class="relative">
                        <img src="${product.imageUrl}" alt="${product.name}" 
                            class="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300">
                        <button onclick="removeFromWishlist(${product.id})" 
                            class="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-red-50">
                            <i class="fas fa-heart text-red-500"></i>
                        </button>
                    </div>
                    <div class="p-4">
                        <h3 class="font-medium text-lg mb-2">${product.name}</h3>
                        <p class="text-gray-600 mb-4">${formatPrice(product.price)}₫</p>
                        <button onclick="addToCart(${product.id})" 
                            class="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                            Thêm Vào Giỏ
                        </button>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load wishlist error:', error);
    }
}

// Remove from wishlist
async function removeFromWishlist(productId) {
    try {
        const response = await apiRequest(`${window.API_BASE_URL}/wishlist/${productId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Đã xóa khỏi danh sách yêu thích', 'success');
            loadWishlist();
        }
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        showToast('Không thể xóa sản phẩm. Vui lòng thử lại.', 'error');
    }
}

// Reset form
function resetForm() {
    document.getElementById('profileForm').reset();
    loadUserProfile();
}

// Helper function to format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}

// Helper function to translate order status
function translateOrderStatus(status) {
    const statusMap = {
        'pending': 'Chờ Xử Lý',
        'processing': 'Đang Xử Lý',
        'shipped': 'Đang Giao Hàng',
        'completed': 'Hoàn Thành',
        'cancelled': 'Đã Hủy'
    };
    return statusMap[status] || status;
}

// Loading indicator functions
function showLoading(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (!loadingIndicator) return;
    
    loadingIndicator.style.display = show ? 'flex' : 'none';
}

// Toast notification function
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