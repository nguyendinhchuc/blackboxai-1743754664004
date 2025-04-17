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

function renderUsers(users) {
    const tableBody = document.getElementById('userTableBody');
    tableBody.innerHTML = users.map(user => `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap">${user.id}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.name}</td>
                    <td class="px-6 py-4 whitespace-nowrap">${user.email}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
    }">
                            ${user.role === 'admin' ? 'Quản Trị Viên' : 'Người Dùng'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }">
                            ${user.status === 'active' ? 'Hoạt Động' : 'Tạm Khóa'}
                        </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button class="text-indigo-600 hover:text-indigo-900 mr-3" onclick="editUser(${user.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="text-red-600 hover:text-red-900" onclick="deleteUser(${user.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
}

async function editUser(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const user = await response.json();

        if (response.ok) {
            document.getElementById('userId').value = user.id;
            document.getElementById('userName').value = user.name;
            document.getElementById('userEmail').value = user.email;
            document.getElementById('userRole').value = user.role;
            document.getElementById('userStatus').value = user.status;
            document.getElementById('userModal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('Lỗi khi tải thông tin người dùng:', error);
    }
}

// Initialize user management
document.addEventListener('DOMContentLoaded', async (e) => {
    if (document.getElementById('userManager')) {
        const searchTerm = e.target.value.toLowerCase();
        const users = await loadUsers();
        const filteredUsers = users.filter(user =>
            user.name.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
        renderUsers(filteredUsers);
    }

    // Modal event listeners
    document.getElementById('closeUserModalBtn').addEventListener('click', () => {
        document.getElementById('userModal').classList.add('hidden');
    });

    document.getElementById('cancelUserBtn').addEventListener('click', () => {
        document.getElementById('userModal').classList.add('hidden');
    });
});