// Banner Management

let banners = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadBanners();
});

// Load Banners
async function loadBanners() {
    try {
        const response = await fetch(`${window.API_BASE_URL}/banners`);
        banners = await response.json();
        renderBanners();
    } catch (error) {
        console.error('Error loading banners:', error);
        showToast('Lỗi tải danh sách banner', 'error');
    }
}

// Render Banners
function renderBanners() {
    const bannerList = document.getElementById('bannerList');
    bannerList.innerHTML = banners.map(banner => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap">
                <img src="${banner.imageUrl}" alt="${banner.title}" class="h-20 w-32 object-cover rounded">
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">${banner.title}</div>
                <div class="text-sm text-gray-500">${banner.link}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                ${banner.order}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${banner.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    ${banner.status === 'active' ? 'Hoạt Động' : 'Không Hoạt Động'}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="editBanner(${banner.id})" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteBanner(${banner.id})" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Modal Management
function openAddBannerModal() {
    document.getElementById('modalTitle').textContent = 'Thêm Banner Mới';
    document.getElementById('bannerForm').reset();
    document.getElementById('bannerId').value = '';
    document.getElementById('imagePreview').classList.add('hidden');
    document.getElementById('bannerModal').classList.remove('hidden');
}

function closeBannerModal() {
    document.getElementById('bannerModal').classList.add('hidden');
}

// Image Preview
document.getElementById('bannerImage').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('imagePreview');
            preview.querySelector('img').src = e.target.result;
            preview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
});

// Form Submission
document.getElementById('bannerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('image', document.getElementById('bannerImage').files[0]);
    formData.append('title', document.getElementById('bannerTitle').value);
    formData.append('link', document.getElementById('bannerLink').value);
    formData.append('order', document.getElementById('bannerOrder').value);
    formData.append('status', document.getElementById('bannerStatus').value);

    const bannerId = document.getElementById('bannerId').value;
    const isEdit = bannerId !== '';

    try {
        const response = await fetch(`${window.API_BASE_URL}/banners${isEdit ? `/${bannerId}` : ''}`, {
            method: isEdit ? 'PUT' : 'POST',
            body: formData
        });

        if (response.ok) {
            showToast(`Banner ${isEdit ? 'cập nhật' : 'thêm'} thành công`, 'success');
            closeBannerModal();
            loadBanners();
        } else {
            const error = await response.json();
            showToast(error.message || 'Có lỗi xảy ra', 'error');
        }
    } catch (error) {
        console.error('Error saving banner:', error);
        showToast('Lỗi khi lưu banner', 'error');
    }
});

// Edit Banner
async function editBanner(id) {
    try {
        const response = await fetch(`${window.API_BASE_URL}/banners/${id}`);
        const banner = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Banner';
        document.getElementById('bannerId').value = banner.id;
        document.getElementById('bannerTitle').value = banner.title;
        document.getElementById('bannerLink').value = banner.link;
        document.getElementById('bannerOrder').value = banner.order;
        document.getElementById('bannerStatus').value = banner.status;
        
        if (banner.imageUrl) {
            const preview = document.getElementById('imagePreview');
            preview.querySelector('img').src = banner.imageUrl;
            preview.classList.remove('hidden');
        }
        
        document.getElementById('bannerModal').classList.remove('hidden');
    } catch (error) {
        console.error('Error loading banner details:', error);
        showToast('Lỗi tải thông tin banner', 'error');
    }
}

// Delete Banner
async function deleteBanner(id) {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/banners/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            showToast('Xóa banner thành công', 'success');
            loadBanners();
        } else {
            const error = await response.json();
            showToast(error.message || 'Có lỗi xảy ra khi xóa banner', 'error');
        }
    } catch (error) {
        console.error('Error deleting banner:', error);
        showToast('Lỗi khi xóa banner', 'error');
    }
}

// Toast Notification
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