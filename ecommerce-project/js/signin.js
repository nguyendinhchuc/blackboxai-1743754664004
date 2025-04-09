// Authentication API endpoints
const AUTH_API_URL = `${window.API_BASE_URL}/auth`;

// Loading indicator functions
function showLoading() {
    document.getElementById('loading-indicator')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-indicator')?.classList.add('hidden');
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

// Sign In Form Handler
document.getElementById('signinForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember-me').checked;

    try {
        showLoading();
        // Use fetch directly for signin since it doesn't need auth headers
        const response = await fetch(`${AUTH_API_URL}/signin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token based on remember me choice
            if (rememberMe) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.role);
            } else {
                sessionStorage.setItem('authToken', data.token);
                sessionStorage.setItem('userRole', data.role);
            }
            
            // Check user role and redirect accordingly
            window.location.href = 'admin/index.html';
            
        } else {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message || 'Đăng nhập không thành công', 'error');
            }
        }
    } catch (error) {
        console.error('Sign in error:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        hideLoading();
    }
});

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (authToken !== undefined && authToken !== null) {
        // If user already has a session, redirect directly to admin page
        window.location.href = 'admin/index.html';
    }
});