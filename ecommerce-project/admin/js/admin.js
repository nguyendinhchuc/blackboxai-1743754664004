// Load environment variables
require('dotenv').config();

// Admin API base URL 
const API_BASE_URL = process.env.API_BASE_URL || 'localhost:8080';

if (!API_BASE_URL) {
    console.error("API_BASE_URL not configured in .env file");
    throw new Error("Missing API configuration");
}

// Set global API_BASE_URL for compatibility
window.API_BASE_URL = API_BASE_URL;

// Verify admin authentication
async function verifyAdmin(token) {
    try {
        // First check OPTIONS to verify CORS
        const optionsResponse = await apiRequest('/auth/verify', {
            method: 'OPTIONS',
            headers: getAuthHeaders()
        });

        if (optionsResponse.status === 401) {
            window.location.href = '../signin.html';
            return;
        }

        // Then verify token
        const verifyResponse = await apiRequest('/auth/verify', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!verifyResponse.ok) {
            window.location.href = '../signin.html';
        }
    } catch (error) {
        console.error('Admin verification error:', error);
        //window.location.href = '../signin.html';
    }
}

// Product Management
async function loadProducts() {
    try {
        const response = await apiRequest('/products', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

async function saveProduct(product) {
    try {
        const response = await apiRequest('/products', {
            method: product.id ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(product)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error saving product:', error);
        return null;
    }
}

async function deleteProduct(productId) {
    try {
        await apiRequest(`/products/${productId}`, {
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

// Order Management
async function loadOrders(status = null) {
    try {
        const endpoint = status ? `/orders?status=${status}` : '/orders';
        const response = await apiRequest(endpoint, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading orders:', error);
        return [];
    }
}

async function updateOrderStatus(orderId, status) {
    try {
        await apiRequest(`/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify({ status })
        });
        return true;
    } catch (error) {
        console.error('Error updating order status:', error);
        return false;
    }
}

// User Management
async function loadUsers() {
    try {
        const response = await apiRequest('/users', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading users:', error);
        return [];
    }
}

async function updateUser(user) {
    try {
        const response = await apiRequest(`/users/${user.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(user)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error updating user:', error);
        return null;
    }
}

// Settings Management
async function loadSettings() {
    try {
        const response = await apiRequest('/settings', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading settings:', error);
        return null;
    }
}

async function saveSettings(settings) {
    try {
        await apiRequest('/settings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(settings)
        });
        return true;
    } catch (error) {
        console.error('Error saving settings:', error);
        return false;
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', async () => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    
    if (!authToken) {
        //window.location.href = '../signin.html?redirect=' + encodeURIComponent(window.location.pathname);
        return;
    }

    try {
        // Verify admin privileges
        await verifyAdmin(authToken);
        
        // Check if user is admin
        //const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        //if (!user || user.role !== 'admin') {
        //    window.location.href = '../products.html';
        //    return;
        //}
    } catch (error) {
        console.error('Admin verification error:', error);
        //window.location.href = '../signin.html?redirect=' + encodeURIComponent(window.location.pathname);
    }
});

// Utility functions
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Make functions available globally
window.admin = {
    loadProducts,
    saveProduct,
    deleteProduct,
    loadOrders,
    updateOrderStatus,
    loadUsers,
    updateUser,
    loadSettings,
    saveSettings,
    showToast
};