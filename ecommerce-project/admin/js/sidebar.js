document.addEventListener('DOMContentLoaded', () => {
    const sidebarContainer = document.getElementById('sidebar-container');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const mainContent = document.getElementById('main-content');
    const desktopToggle = document.getElementById('desktop-toggle');

    if (!sidebarContainer || !sidebarToggle || !desktopToggle) return;

    // Toggle for mobile
    sidebarToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarContainer.classList.toggle('collapsed');
    });

    // Toggle for desktop
    desktopToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebarContainer.classList.toggle('collapsed');
    });

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 1024) {
            const isClickInside = sidebarContainer.contains(e.target);
            if (!isClickInside && !sidebarContainer.classList.contains('collapsed')) {
                sidebarContainer.classList.add('collapsed');
            }
        }
    });
});
