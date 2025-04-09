// Load environment variables
require('dotenv').config();

// API base URL configuration
const API_BASE_URL = process.env.API_BASE_URL || 'localhost:8080';

if (!API_BASE_URL) {
    console.error("API_BASE_URL not configured in .env file");
    throw new Error("Missing API configuration");
}

// Set global API_BASE_URL for compatibility
window.API_BASE_URL = API_BASE_URL;

// API utility functions
const getAuthToken = () => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
};

const getAuthHeaders = () => {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// API request wrapper using jQuery AJAX
const apiRequest = (endpoint, options = {}) => {
    return new Promise((resolve, reject) => {
        const isAuthEndpoint = endpoint.includes('/auth/signin') || endpoint.includes('/auth/signup');
        const headers = isAuthEndpoint ? 
            { 'Content-Type': 'application/json' } : 
            getAuthHeaders();

        const fullUrl = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

        $.ajax({
            url: fullUrl,
            type: options.method || 'GET',
            data: options.body || null,
            headers: {
                ...headers,
                ...(options.headers || {})
            },
            dataType: 'json',
            success: (data, textStatus, xhr) => {
                resolve({
                    ok: true,
                    status: xhr.status,
                    json: () => Promise.resolve(data)
                });
            },
            error: (xhr) => {
                resolve({
                    ok: false,
                    status: xhr.status,
                    json: () => Promise.resolve(xhr.responseJSON || {})
                });
            }
        });
    });
};

// Export functions
window.apiRequest = apiRequest;
window.getAuthToken = getAuthToken;
window.getAuthHeaders = getAuthHeaders;