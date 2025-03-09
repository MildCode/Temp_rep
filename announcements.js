/**
 * Announcements JavaScript File
 * Gujarat Ministry of Defence - HOD Department
 * 
 * This file contains functionality for announcement management
 */

// Initialize announcements page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Announcements page initialized');
    
    // Load announcements data
    loadAnnouncementsData();
    
    // Update announcement stats
    updateAnnouncementStats();
    
    // Initialize announcement chart
    initializeAnnouncementChart();
    
    // Setup event listeners
    setupAnnouncementsEventListeners();
});

// Setup event listeners for announcements page
function setupAnnouncementsEventListeners() {
    // Add announcement form submit
    const saveAnnouncementBtn = document.getElementById('saveAnnouncementBtn');
    if (saveAnnouncementBtn) {
        saveAnnouncementBtn.addEventListener('click', addAnnouncement);
    }
    
    // Update announcement form submit
    const updateAnnouncementBtn = document.getElementById('updateAnnouncementBtn');
    if (updateAnnouncementBtn) {
        updateAnnouncementBtn.addEventListener('click', updateAnnouncement);
    }
    
    // Delete announcement button
    const deleteAnnouncementBtn = document.getElementById('deleteAnnouncementBtn');
    if (deleteAnnouncementBtn) {
        deleteAnnouncementBtn.addEventListener('click', function() {
            const announcementId = document.getElementById('editAnnouncementId').value;
            showDeleteConfirmation(announcementId);
        });
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteAnnouncement);
    }
    
    // Search announcements
    const announcementSearchBtn = document.getElementById('announcementSearchBtn');
    if (announcementSearchBtn) {
        announcementSearchBtn.addEventListener('click', searchAnnouncements);
    }
    
    // Search on enter key
    const announcementSearch = document.getElementById('announcementSearch');
    if (announcementSearch) {
        announcementSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAnnouncements();
            }
        });
    }
    
    // Export announcements
    const exportAnnouncementsBtn = document.getElementById('exportAnnouncements');
    if (exportAnnouncementsBtn) {
        exportAnnouncementsBtn.addEventListener('click', exportAnnouncementsData);
    }
    
    // Print announcements
    const printAnnouncementsBtn = document.getElementById('printAnnouncements');
    if (printAnnouncementsBtn) {
        printAnnouncementsBtn.addEventListener('click', function() {
            printContent('announcementsList');
        });
    }
    
    // Filter buttons
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                filterAnnouncementsByCategory(filter);
                
                // Update active state of filter buttons
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
            });
        });
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            filterAnnouncementsByDate(this.value);
        });
    }
    
    // Priority filter
    const priorityFilter = document.getElementById('priorityFilter');
    if (priorityFilter) {
        priorityFilter.addEventListener('change', function() {
            filterAnnouncementsByPriority(this.value);
        });
    }
    
    // Reset filters button
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            resetAnnouncementFilters();
        });
    }
    
    // Toggle archive button
    const archiveToggleBtn = document.getElementById('archiveToggleBtn');
    if (archiveToggleBtn) {
        archiveToggleBtn.addEventListener('click', function() {
            toggleArchiveView();
        });
    }
}

// Load announcements data and populate the list
function loadAnnouncementsData() {
    const announcementsListElement = document.getElementById('announcementsList');
    const announcementCountElement = document.getElementById('announcementCount');
    
    if (!announcementsListElement) return;
    
    // Get announcements from localStorage
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Set showing archived flag (default: false)
    window.showingArchived = window.showingArchived || false;
    
    // Filter out archived announcements if not showing archived
    if (!window.showingArchived) {
        announcements = announcements.filter(announcement => !announcement.archived);
    }
    
    // Sort announcements: pinned first, then by date (newest first)
    announcements.sort((a, b) => {
        // Pinned announcements first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        // Then sort by date (newest first)
        return new Date(b.date) - new Date(a.date);
    });
    
    // Update announcement count
    if (announcementCountElement) {
        announcementCountElement.textContent = announcements.length;
    }
    
    // If no announcements, show message
    if (announcements.length === 0) {
        announcementsListElement.innerHTML = '';
        document.getElementById('noAnnouncementsMessage').classList.remove('d-none');
        return;
    } else {
        document.getElementById('noAnnouncementsMessage').classList.add('d-none');
    }
    
    // Generate HTML for announcements
    let html = '';
    
    announcements.forEach((announcement) => {
        // Determine priority class for left border
        let priorityClass = '';
        switch (announcement.priority) {
            case 'High':
                priorityClass = 'priority-high';
                break;
            case 'Medium':
                priorityClass = 'priority-medium';
                break;
            case 'Low':
                priorityClass = 'priority-low';
                break;
        }
        
        // Determine category badge class
        let categoryClass = '';
        switch (announcement.category) {
            case 'Alert':
                categoryClass = 'danger';
                break;
            case 'Meeting':
                categoryClass = 'success';
                break;
            case 'Event':
                categoryClass = 'warning';
                break;
            case 'News':
                categoryClass = 'info';
                break;
            default:
                categoryClass = 'secondary';
        }
        
        // Format dates
        const formattedDate = formatDate(announcement.date);
        const formattedExpiry = announcement.expiry ? formatDate(announcement.expiry) : 'No expiry';
        
        // Check if announcement is expired
        let isExpired = false;
        if (announcement.expiry) {
            const expiryDate = new Date(announcement.expiry);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            isExpired = expiryDate < today;
        }
        
        html += `
            <div class="col announcement-item" data-category="${announcement.category}" data-priority="${announcement.priority}" data-date="${announcement.date}">
                <div class="card announcement-card ${priorityClass} ${announcement.pinned ? 'border-top border-primary' : ''} ${isExpired ? 'opacity-50' : ''}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0">${announcement.title}</h5>
                            <div class="announcement-date text-muted">
                                <small>${formattedDate}</small>
                                ${announcement.pinned ? '<span class="ms-2 badge bg-primary">Pinned</span>' : ''}
                                ${isExpired ? '<span class="ms-2 badge bg-danger">Expired</span>' : ''}
                                ${announcement.archived ? '<span class="ms-2 badge bg-secondary">Archived</span>' : ''}
                            </div>
                        </div>
                        <span class="badge bg-${categoryClass}">${announcement.category}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${announcement.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-${announcement.priority === 'High' ? 'danger' : announcement.priority === 'Medium' ? 'warning' : 'success'}">${announcement.priority} Priority</span>
                            ${announcement.expiry ? `<small class="ms-2 text-muted">Expires: ${formattedExpiry}</small>` : ''}
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-announcement-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning edit-announcement-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-announcement-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    announcementsListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addAnnouncementButtonEventListeners();
}

// Add event listeners to announcement action buttons
function addAnnouncementButtonEventListeners() {
    // View announcement buttons
    const viewButtons = document.querySelectorAll('.view-announcement-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const announcementId = this.getAttribute('data-announcement-id');
            viewAnnouncement(announcementId);
        });
    });
    
    // Edit announcement buttons
    const editButtons = document.querySelectorAll('.edit-announcement-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const announcementId = this.getAttribute('data-announcement-id');
            editAnnouncement(announcementId);
        });
    });
    
    // Delete announcement buttons
    const deleteButtons = document.querySelectorAll('.delete-announcement-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const announcementId = this.getAttribute('data-announcement-id');
            showDeleteConfirmation(announcementId);
        });
    });
}

// Update announcement statistics
function updateAnnouncementStats() {
    // Get announcements from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Count total announcements
    const totalAnnouncements = announcements.length;
    
    // Count announcements by priority
    const highPriority = announcements.filter(announcement => announcement.priority === 'High').length;
    const mediumPriority = announcements.filter(announcement => announcement.priority === 'Medium').length;
    const lowPriority = announcements.filter(announcement => announcement.priority === 'Low').length;
    
    // Update counters
    document.getElementById('total-announcement-count').textContent = totalAnnouncements;
    document.getElementById('high-priority-count').textContent = highPriority;
    document.getElementById('medium-priority-count').textContent = mediumPriority;
    document.getElementById('low-priority-count').textContent = lowPriority;
    
    // Update progress bars
    if (totalAnnouncements > 0) {
        const highPercent = Math.round((highPriority / totalAnnouncements) * 100);
        const mediumPercent = Math.round((mediumPriority / totalAnnouncements) * 100);
        const lowPercent = Math.round((lowPriority / totalAnnouncements) * 100);
        
        document.getElementById('high-priority-bar').style.width = highPercent + '%';
        document.getElementById('medium-priority-bar').style.width = mediumPercent + '%';
        document.getElementById('low-priority-bar').style.width = lowPercent + '%';
    } else {
        document.getElementById('high-priority-bar').style.width = '0%';
        document.getElementById('medium-priority-bar').style.width = '0%';
        document.getElementById('low-priority-bar').style.width = '0%';
    }
}

// Initialize announcement chart
function initializeAnnouncementChart() {
    const canvas = document.getElementById('announcementChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get announcements from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Count announcements by category
    const categoryCounts = {
        'General': 0,
        'Meeting': 0,
        'Alert': 0,
        'Event': 0,
        'News': 0
    };
    
    announcements.forEach(announcement => {
        if (categoryCounts.hasOwnProperty(announcement.category)) {
            categoryCounts[announcement.category]++;
        } else {
            categoryCounts[announcement.category] = 1;
        }
    });
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(categoryCounts),
            datasets: [{
                label: 'Announcements',
                data: Object.values(categoryCounts),
                backgroundColor: [
                    'rgba(108, 117, 125, 0.8)',  // General - Gray
                    'rgba(40, 167, 69, 0.8)',    // Meeting - Green
                    'rgba(220, 53, 69, 0.8)',    // Alert - Red
                    'rgba(255, 193, 7, 0.8)',    // Event - Yellow
                    'rgba(23, 162, 184, 0.8)'    // News - Cyan
                ],
                borderColor: [
                    'rgba(108, 117, 125, 1)',
                    'rgba(40, 167, 69, 1)',
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(23, 162, 184, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// View announcement details
function viewAnnouncement(id) {
    // Get announcements from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Find the announcement by ID
    const announcement = announcements.find(a => a.id == id);
    
    if (!announcement) {
        showNotification('Error', 'Announcement not found', 'danger');
        return;
    }
    
    // Populate the view modal
    document.getElementById('viewAnnouncementTitle').textContent = announcement.title;
    document.getElementById('viewAnnouncementCategory').textContent = announcement.category;
    document.getElementById('viewAnnouncementPriority').textContent = announcement.priority;
    document.getElementById('viewAnnouncementDate').textContent = formatDate(announcement.date);
    document.getElementById('viewAnnouncementContent').textContent = announcement.content;
    
    // Set expiry text
    if (announcement.expiry) {
        document.getElementById('viewAnnouncementExpiry').textContent = 'Expires on: ' + formatDate(announcement.expiry);
        
        // Check if expired
        const expiryDate = new Date(announcement.expiry);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiryDate < today) {
            document.getElementById('viewAnnouncementStatus').innerHTML = '<span class="badge bg-danger">Expired</span>';
        } else {
            document.getElementById('viewAnnouncementStatus').innerHTML = '<span class="badge bg-success">Active</span>';
        }
    } else {
        document.getElementById('viewAnnouncementExpiry').textContent = 'Expires on: Never';
        document.getElementById('viewAnnouncementStatus').innerHTML = '<span class="badge bg-success">Active</span>';
    }
    
    // Show archived status if applicable
    if (announcement.archived) {
        document.getElementById('viewAnnouncementStatus').innerHTML = '<span class="badge bg-secondary">Archived</span>';
    }
    
    // Determine category badge class
    let categoryClass = '';
    switch (announcement.category) {
        case 'Alert':
            categoryClass = 'danger';
            break;
        case 'Meeting':
            categoryClass = 'success';
            break;
        case 'Event':
            categoryClass = 'warning';
            break;
        case 'News':
            categoryClass = 'info';
            break;
        default:
            categoryClass = 'secondary';
    }
    document.getElementById('viewAnnouncementCategory').className = `badge bg-${categoryClass} me-2`;
    
    // Determine priority badge class
    let priorityClass = '';
    switch (announcement.priority) {
        case 'High':
            priorityClass = 'danger';
            break;
        case 'Medium':
            priorityClass = 'warning';
            break;
        case 'Low':
            priorityClass = 'success';
            break;
        default:
            priorityClass = 'secondary';
    }
    document.getElementById('viewAnnouncementPriority').className = `badge bg-${priorityClass}`;
    
    // Set up edit button
    const editBtn = document.getElementById('announcementEditBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Hide view modal
            const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewAnnouncementModal'));
            viewModal.hide();
            
            // Show edit modal
            editAnnouncement(id);
        });
    }
    
    // Show the modal
    removeModalBackdrops();
    const viewModal = new bootstrap.Modal(document.getElementById('viewAnnouncementModal'));
    viewModal.show();
}

// Edit announcement
function editAnnouncement(id) {
    // Check if user is logged in
    if (!requireLogin()) return;
    
    // Get announcements from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Find the announcement by ID
    const announcement = announcements.find(a => a.id == id);
    
    if (!announcement) {
        showNotification('Error', 'Announcement not found', 'danger');
        return;
    }
    
    // Populate the edit form
    document.getElementById('editAnnouncementId').value = announcement.id;
    document.getElementById('editAnnouncementTitle').value = announcement.title;
    document.getElementById('editAnnouncementContent').value = announcement.content;
    document.getElementById('editAnnouncementCategory').value = announcement.category;
    document.getElementById('editAnnouncementPriority').value = announcement.priority;
    document.getElementById('editAnnouncementDate').value = announcement.date;
    document.getElementById('editAnnouncementExpiry').value = announcement.expiry || '';
    document.getElementById('editAnnouncementPinned').checked = announcement.pinned;
    document.getElementById('editAnnouncementArchived').checked = announcement.archived;
    
    // Clean up any modal backdrops and show the modal
    removeModalBackdrops();
    const editModal = new bootstrap.Modal(document.getElementById('editAnnouncementModal'));
    editModal.show();
}

// Show delete confirmation
function showDeleteConfirmation(id) {
    // Check if user is logged in
    if (!requireLogin()) return;
    
    // Get announcements from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Find the announcement by ID
    const announcement = announcements.find(a => a.id == id);
    
    if (!announcement) {
        showNotification('Error', 'Announcement not found', 'danger');
        return;
    }
    
    // Set announcement ID (hidden)
    document.getElementById('editAnnouncementId').value = announcement.id;
    
    // Set announcement title in confirmation modal
    document.getElementById('deleteAnnouncementTitle').textContent = announcement.title;
    
    // Clean up any modal backdrops and show the modal
    removeModalBackdrops();
    const confirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    confirmModal.show();
}

// Add new announcement
function addAnnouncement() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', 'addAnnouncement');
        return;
    }
    
    // Get form values
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    const category = document.getElementById('announcementCategory').value;
    const priority = document.getElementById('announcementPriority').value;
    const date = document.getElementById('announcementDate').value;
    const expiry = document.getElementById('announcementExpiry').value;
    const pinned = document.getElementById('announcementPinned').checked;
    
    // Basic validation
    if (!title || !content || !category || !priority || !date) {
        showNotification('Error', 'Please fill in all required fields', 'danger');
        return;
    }
    
    // Get existing announcements
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Generate a unique ID
    const id = announcements.length > 0 ? Math.max(...announcements.map(a => a.id)) + 1 : 1;
    
    // Create announcement object
    const newAnnouncement = {
        id,
        title,
        content,
        category,
        priority,
        date,
        expiry: expiry || null,
        pinned,
        archived: false
    };
    
    // Add to announcements array
    announcements.push(newAnnouncement);
    
    // Save to localStorage
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // Log the activity
    logActivity('Added announcement', 'Administrator', `Added announcement: ${title}`);
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addAnnouncementModal'));
    modal.hide();
    
    // Reset the form
    document.getElementById('addAnnouncementForm').reset();
    
    // Reload announcements data
    loadAnnouncementsData();
    
    // Update announcement stats
    updateAnnouncementStats();
    
    // Refresh chart
    initializeAnnouncementChart();
    
    // Show success message
    showNotification('Success', 'Announcement added successfully', 'success');
}

// Update announcement
function updateAnnouncement() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        const id = document.getElementById('editAnnouncementId').value;
        localStorage.setItem('pendingAdminAction', `edit:announcement:${id}`);
        return;
    }
    
    // Get form values
    const id = document.getElementById('editAnnouncementId').value;
    const title = document.getElementById('editAnnouncementTitle').value;
    const content = document.getElementById('editAnnouncementContent').value;
    const category = document.getElementById('editAnnouncementCategory').value;
    const priority = document.getElementById('editAnnouncementPriority').value;
    const date = document.getElementById('editAnnouncementDate').value;
    const expiry = document.getElementById('editAnnouncementExpiry').value;
    const pinned = document.getElementById('editAnnouncementPinned').checked;
    const archived = document.getElementById('editAnnouncementArchived').checked;
    
    // Basic validation
    if (!title || !content || !category || !priority || !date) {
        showNotification('Error', 'Please fill in all required fields', 'danger');
        return;
    }
    
    // Get existing announcements
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Find the announcement by ID
    const index = announcements.findIndex(a => a.id == id);
    
    if (index === -1) {
        showNotification('Error', 'Announcement not found', 'danger');
        return;
    }
    
    // Update announcement
    announcements[index] = {
        id: parseInt(id),
        title,
        content,
        category,
        priority,
        date,
        expiry: expiry || null,
        pinned,
        archived
    };
    
    // Save to localStorage
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // Log the activity
    logActivity('Updated announcement', 'Administrator', `Updated announcement: ${title}`);
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editAnnouncementModal'));
    modal.hide();
    
    // Reload announcements data
    loadAnnouncementsData();
    
    // Update announcement stats
    updateAnnouncementStats();
    
    // Refresh chart
    initializeAnnouncementChart();
    
    // Show success message
    showNotification('Success', 'Announcement updated successfully', 'success');
}

// Delete announcement
function deleteAnnouncement() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        const id = document.getElementById('editAnnouncementId').value;
        localStorage.setItem('pendingAdminAction', `delete:announcement:${id}`);
        return;
    }
    
    // Get announcement ID
    const id = document.getElementById('editAnnouncementId').value;
    
    // Get existing announcements
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Find the announcement by ID
    const index = announcements.findIndex(a => a.id == id);
    
    if (index === -1) {
        showNotification('Error', 'Announcement not found', 'danger');
        return;
    }
    
    // Store announcement details for logging
    const announcement = announcements[index];
    
    // Remove the announcement
    announcements.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('announcements', JSON.stringify(announcements));
    
    // Log the activity
    logActivity('Deleted announcement', 'Administrator', `Deleted announcement: ${announcement.title}`);
    
    // Hide the modals
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editAnnouncementModal'));
    if (editModal) editModal.hide();
    
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (confirmModal) confirmModal.hide();
    
    // Reload announcements data
    loadAnnouncementsData();
    
    // Update announcement stats
    updateAnnouncementStats();
    
    // Refresh chart
    initializeAnnouncementChart();
    
    // Show success message
    showNotification('Success', 'Announcement deleted successfully', 'success');
}

// Search announcements
function searchAnnouncements() {
    const searchTerm = document.getElementById('announcementSearch').value.toLowerCase();
    
    // If search term is empty, load all announcements
    if (!searchTerm.trim()) {
        loadAnnouncementsData();
        return;
    }
    
    // Get announcements from localStorage
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Filter out archived announcements if not showing archived
    if (!window.showingArchived) {
        announcements = announcements.filter(announcement => !announcement.archived);
    }
    
    // Filter announcements by search term
    const filteredAnnouncements = announcements.filter(announcement => {
        return (
            announcement.title.toLowerCase().includes(searchTerm) ||
            announcement.content.toLowerCase().includes(searchTerm) ||
            announcement.category.toLowerCase().includes(searchTerm)
        );
    });
    
    // Update announcement count
    const announcementCountElement = document.getElementById('announcementCount');
    if (announcementCountElement) {
        announcementCountElement.textContent = filteredAnnouncements.length;
    }
    
    // Get the announcements list element
    const announcementsListElement = document.getElementById('announcementsList');
    if (!announcementsListElement) return;
    
    // If no matching announcements, show message
    if (filteredAnnouncements.length === 0) {
        announcementsListElement.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-search fa-3x mb-3"></i>
                    <p>No announcements found matching "${searchTerm}"</p>
                    <button class="btn btn-outline-secondary mt-2" onclick="loadAnnouncementsData()">
                        <i class="fas fa-sync-alt"></i> Show All Announcements
                    </button>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate HTML for filtered announcements
    let html = '';
    
    // Sort announcements: pinned first, then by date (newest first)
    const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
        // Pinned announcements first
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        
        // Then sort by date (newest first)
        return new Date(b.date) - new Date(a.date);
    });
    
    sortedAnnouncements.forEach((announcement) => {
        // Determine priority class for left border
        let priorityClass = '';
        switch (announcement.priority) {
            case 'High':
                priorityClass = 'priority-high';
                break;
            case 'Medium':
                priorityClass = 'priority-medium';
                break;
            case 'Low':
                priorityClass = 'priority-low';
                break;
        }
        
        // Determine category badge class
        let categoryClass = '';
        switch (announcement.category) {
            case 'Alert':
                categoryClass = 'danger';
                break;
            case 'Meeting':
                categoryClass = 'success';
                break;
            case 'Event':
                categoryClass = 'warning';
                break;
            case 'News':
                categoryClass = 'info';
                break;
            default:
                categoryClass = 'secondary';
        }
        
        // Format dates
        const formattedDate = formatDate(announcement.date);
        const formattedExpiry = announcement.expiry ? formatDate(announcement.expiry) : 'No expiry';
        
        // Check if announcement is expired
        let isExpired = false;
        if (announcement.expiry) {
            const expiryDate = new Date(announcement.expiry);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            isExpired = expiryDate < today;
        }
        
        html += `
            <div class="col announcement-item" data-category="${announcement.category}" data-priority="${announcement.priority}" data-date="${announcement.date}">
                <div class="card announcement-card ${priorityClass} ${announcement.pinned ? 'border-top border-primary' : ''} ${isExpired ? 'opacity-50' : ''}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-0">${announcement.title}</h5>
                            <div class="announcement-date text-muted">
                                <small>${formattedDate}</small>
                                ${announcement.pinned ? '<span class="ms-2 badge bg-primary">Pinned</span>' : ''}
                                ${isExpired ? '<span class="ms-2 badge bg-danger">Expired</span>' : ''}
                                ${announcement.archived ? '<span class="ms-2 badge bg-secondary">Archived</span>' : ''}
                            </div>
                        </div>
                        <span class="badge bg-${categoryClass}">${announcement.category}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${announcement.content}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <div>
                            <span class="badge bg-${announcement.priority === 'High' ? 'danger' : announcement.priority === 'Medium' ? 'warning' : 'success'}">${announcement.priority} Priority</span>
                            ${announcement.expiry ? `<small class="ms-2 text-muted">Expires: ${formattedExpiry}</small>` : ''}
                        </div>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-announcement-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning edit-announcement-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger delete-announcement-btn" data-announcement-id="${announcement.id}">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    announcementsListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addAnnouncementButtonEventListeners();
    
    // Show notification
    showNotification('Search Results', `Found ${filteredAnnouncements.length} announcements matching "${searchTerm}"`, 'info');
}

// Filter announcements by category
function filterAnnouncementsByCategory(category) {
    // Get announcements from localStorage
    let announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    // Filter out archived announcements if not showing archived
    if (!window.showingArchived) {
        announcements = announcements.filter(announcement => !announcement.archived);
    }
    
    // Get all announcement items
    const announcementItems = document.querySelectorAll('.announcement-item');
    
    // No announcements to filter
    if (announcementItems.length === 0) {
        return;
    }
    
    // Show all if category is 'all'
    if (category === 'all') {
        announcementItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Update count
        document.getElementById('announcementCount').textContent = announcementItems.length;
        
        // Show notification
        showNotification('Filter', 'Showing all announcements', 'info');
        return;
    }
    
    // Filter announcements by category
    let count = 0;
    announcementItems.forEach(item => {
        if (item.dataset.category === category) {
            item.style.display = 'block';
            count++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('announcementCount').textContent = count;
    
    // Show notification
    showNotification('Filter', `Showing ${count} ${category} announcements`, 'info');
}

// Filter announcements by date
function filterAnnouncementsByDate(dateRange) {
    // Get all announcement items
    const announcementItems = document.querySelectorAll('.announcement-item');
    
    // No announcements to filter
    if (announcementItems.length === 0) {
        return;
    }
    
    // Show all if dateRange is 'all'
    if (dateRange === 'all') {
        announcementItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Update count
        document.getElementById('announcementCount').textContent = announcementItems.length;
        
        // Show notification
        showNotification('Filter', 'Showing announcements from all dates', 'info');
        return;
    }
    
    // Get current date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate date range
    let rangeStart = new Date();
    rangeStart.setHours(0, 0, 0, 0);
    
    if (dateRange === 'today') {
        // No change to rangeStart
    } else if (dateRange === 'week') {
        rangeStart.setDate(today.getDate() - 7);
    } else if (dateRange === 'month') {
        rangeStart.setMonth(today.getMonth() - 1);
    }
    
    // Filter announcements by date
    let count = 0;
    announcementItems.forEach(item => {
        const announcementDate = new Date(item.dataset.date);
        
        if (announcementDate >= rangeStart) {
            item.style.display = 'block';
            count++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('announcementCount').textContent = count;
    
    // Show notification
    let rangeText = '';
    if (dateRange === 'today') {
        rangeText = 'today';
    } else if (dateRange === 'week') {
        rangeText = 'this week';
    } else if (dateRange === 'month') {
        rangeText = 'this month';
    }
    
    showNotification('Filter', `Showing ${count} announcements from ${rangeText}`, 'info');
}

// Filter announcements by priority
function filterAnnouncementsByPriority(priority) {
    // Get all announcement items
    const announcementItems = document.querySelectorAll('.announcement-item');
    
    // No announcements to filter
    if (announcementItems.length === 0) {
        return;
    }
    
    // Show all if priority is 'all'
    if (priority === 'all') {
        announcementItems.forEach(item => {
            item.style.display = 'block';
        });
        
        // Update count
        document.getElementById('announcementCount').textContent = announcementItems.length;
        
        // Show notification
        showNotification('Filter', 'Showing announcements of all priorities', 'info');
        return;
    }
    
    // Filter announcements by priority
    let count = 0;
    announcementItems.forEach(item => {
        const itemPriority = item.dataset.priority.toLowerCase();
        
        if (itemPriority === priority) {
            item.style.display = 'block';
            count++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Update count
    document.getElementById('announcementCount').textContent = count;
    
    // Show notification
    const priorityText = priority.charAt(0).toUpperCase() + priority.slice(1);
    showNotification('Filter', `Showing ${count} ${priorityText} priority announcements`, 'info');
}

// Reset all announcement filters
function resetAnnouncementFilters() {
    // Reset filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate the 'All' filter button
    const allFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allFilterBtn) {
        allFilterBtn.classList.add('active');
    }
    
    // Reset date filter
    document.getElementById('dateFilter').value = 'all';
    
    // Reset priority filter
    document.getElementById('priorityFilter').value = 'all';
    
    // Reload all announcements
    loadAnnouncementsData();
    
    // Show notification
    showNotification('Filters Reset', 'All filters have been reset', 'info');
}

// Toggle between showing active and archived announcements
function toggleArchiveView() {
    // Toggle the flag
    window.showingArchived = !window.showingArchived;
    
    // Update button text
    const archiveToggleBtn = document.getElementById('archiveToggleBtn');
    if (archiveToggleBtn) {
        if (window.showingArchived) {
            archiveToggleBtn.innerHTML = '<i class="fas fa-archive"></i> Hide Archive';
        } else {
            archiveToggleBtn.innerHTML = '<i class="fas fa-archive"></i> Show Archive';
        }
    }
    
    // Reload announcements data
    loadAnnouncementsData();
    
    // Show notification
    if (window.showingArchived) {
        showNotification('Archive', 'Showing archived announcements', 'info');
    } else {
        showNotification('Archive', 'Showing active announcements only', 'info');
    }
}

// Export announcements data as CSV
function exportAnnouncementsData() {
    // Get announcements from localStorage
    const announcements = JSON.parse(localStorage.getItem('announcements')) || [];
    
    if (announcements.length === 0) {
        showNotification('Export Failed', 'No announcement data to export', 'danger');
        return;
    }
    
    // Prepare data for export (simplify and flatten)
    const exportData = announcements.map(a => {
        return {
            ID: a.id,
            Title: a.title,
            Content: a.content,
            Category: a.category,
            Priority: a.priority,
            Date: formatDate(a.date),
            Expiry: a.expiry ? formatDate(a.expiry) : 'None',
            Pinned: a.pinned ? 'Yes' : 'No',
            Archived: a.archived ? 'Yes' : 'No'
        };
    });
    
    // Export to CSV
    exportToCSV(exportData, 'announcements_data.csv');
}
