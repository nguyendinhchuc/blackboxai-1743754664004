// Environment variables simulation for browser
window.process = {
    env: {
        NODE_ENV: 'development',
        API_BASE_URL: 'https://ecommece-af2a0921deff.herokuapp.com/ecommerce/api',
        API_BASE_URL_URL: 'https://ecommece-af2a0921deff.herokuapp.com/ecommerce/api/admin'
    }
};

// Admin Shared Utilities
const AdminUtils = {
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md text-white ${
            type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    verifyAdmin() {
        const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user'));
        return user && user.role === 'admin';
    }
};

// Admin API Base URL (will be set in HTML file)
window.API_BASE_URL = window.API_BASE_URL || 'http://localhost:8080/api/admin';