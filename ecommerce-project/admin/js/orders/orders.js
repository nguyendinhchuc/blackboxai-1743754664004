// Order Management Functions
const OrderManager = {
    async loadOrders(status = null) {
        try {
            const url = status ? `${API_BASE_URL}/orders?status=${status}` : `${API_BASE_URL}/orders`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error loading orders:', error);
            return [];
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
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
};

// Initialize order management
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('orderManager')) {
        const orders = await OrderManager.loadOrders();
        // Render order list
    }
});