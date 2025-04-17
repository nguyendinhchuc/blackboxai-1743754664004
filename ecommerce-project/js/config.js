// Load environment variables
const config = {
    API_BASE_URL: 'http://localhost:8080/ecommerce/api',  // This will be proxied through our Express server
    FRONTEND_URL: 'http://localhost:8000',
    NODE_ENV: 'development'
};

// Make config available globally
window.API_BASE_URL = config.API_BASE_URL;
window.FRONTEND_URL = config.FRONTEND_URL;
window.NODE_ENV = config.NODE_ENV;