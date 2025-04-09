// Search functionality
const searchAPI = `${window.API_BASE_URL}/search`;

// Debounce function to limit API calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (searchInput) {
        // Add search input to navigation
        const nav = document.querySelector('nav .max-w-6xl .flex.justify-between');
        const searchContainer = document.createElement('div');
        searchContainer.className = 'relative hidden md:block';
        searchContainer.innerHTML = `
            <div class="relative">
                <input type="search" id="searchInput"
                    class="w-64 px-4 py-2 pl-10 pr-8 rounded-full border border-gray-300 focus:outline-none focus:border-indigo-500"
                    placeholder="Tìm kiếm sản phẩm...">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <i class="fas fa-search text-gray-400"></i>
                </div>
                <button id="clearSearch" class="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hidden">
                    <i class="fas fa-times text-gray-400"></i>
                </button>
            </div>
            <div id="searchResults" class="absolute z-50 mt-2 w-full bg-white rounded-md shadow-lg hidden"></div>
        `;
        nav.insertBefore(searchContainer, nav.lastElementChild);

        // Clear search button functionality
        const clearButton = document.getElementById('clearSearch');
        searchInput.addEventListener('input', () => {
            clearButton.classList.toggle('hidden', !searchInput.value);
        });
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchResults.classList.add('hidden');
            clearButton.classList.add('hidden');
        });

        // Handle search input with debounce
        searchInput.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                searchResults.classList.add('hidden');
                return;
            }

            try {
                const response = await apiRequest(`${searchAPI}?q=${encodeURIComponent(query)}`);
                const data = await response.json();

                if (response.ok && data.products.length > 0) {
                    searchResults.innerHTML = `
                        <div class="py-2">
                            ${data.products.map(product => `
                                <a href="product-detail.html?id=${product.id}" 
                                   class="flex items-center px-4 py-2 hover:bg-gray-100">
                                    <img src="${product.imageUrl}" alt="${product.name}" 
                                         class="w-12 h-12 object-cover rounded">
                                    <div class="ml-3">
                                        <p class="text-sm font-medium text-gray-900">${product.name}</p>
                                        <p class="text-sm text-gray-500">${formatPrice(product.price)}₫</p>
                                    </div>
                                </a>
                            `).join('')}
                        </div>
                    `;
                    searchResults.classList.remove('hidden');
                } else {
                    searchResults.innerHTML = `
                        <div class="px-4 py-3 text-sm text-gray-500">
                            Không tìm thấy sản phẩm nào
                        </div>
                    `;
                    searchResults.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Search error:', error);
            }
        }, 300));

        // Close search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!searchContainer.contains(e.target)) {
                searchResults.classList.add('hidden');
            }
        });
    }
});

// Format price helper function
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN').format(price);
}