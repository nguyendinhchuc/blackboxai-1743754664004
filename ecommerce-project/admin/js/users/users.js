// User Management Functions
const UserManager = {
    async loadUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            return await response.json();
        } catch (error) {
            console.error('Error loading users:', error);
            return [];
        }
    },

    async updateUser(user) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(user)
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating user:', error);
            return null;
        }
    }
};

// Initialize user management
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('userManager')) {
        const users = await UserManager.loadUsers();
        // Render user list
    }
});