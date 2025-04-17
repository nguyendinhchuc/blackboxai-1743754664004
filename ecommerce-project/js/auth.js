
// Authentication API endpoints
const AUTH_API_URL = `${window.API_BASE_URL}/auth`;

// Loading indicator functions
function showLoading() {
    document.getElementById('loading-indicator')?.classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loading-indicator')?.classList.add('hidden');
}

// Sign Up Form Handler
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    // Password confirmation validation
    if (formData.password !== document.getElementById('confirmPassword').value) {
        showToast('Passwords do not match', 'error');
        return;
    }

    try {
        showLoading();
        const response = await fetch(`${AUTH_API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            showToast('Account created successfully! Please sign in.', 'success');
            setTimeout(() => {
                window.location.href = 'dangnhap.html';
            }, 2000);
        } else {
            if (data.error) {
                showToast(data.error, 'error');
            } else {
                showToast(data.message || 'Đăng ký không thành công', 'error');
            }
        }
    } catch (error) {
        console.error('Sign up error:', error);
        showToast('Lỗi kết nối. Vui lòng thử lại sau.', 'error');
    } finally {
        hideLoading();
    }
});

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

// Check authentication status on page load
document.addEventListener('DOMContentLoaded', () => {
    // Skip auth check for development
    if (window.location.hostname === 'localhost') {
        return;
    }
    
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (!authToken) {
        window.location.href = '/ecommerce-project/dangnhap.html';
    }
});
