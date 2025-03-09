/**
 * Main JavaScript File
 * Gujarat Ministry of Defence - HOD Department
 * 
 * This file contains common functions used across the application
 */

// Initialize application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Ministry of Defence HOD Department Portal initialized');
    
    // Check if admin is logged in
    checkLoginStatus();
    
    // Initialize admin login form handler
    initializeLoginForm();
    
    // Seed initial data if not available
    initializeAppData();
    
    // Initialize theme toggle
    initializeThemeToggle();
    
    // Add animation classes to elements
    addAnimationClasses();
});

// Check if the admin is logged in and update UI accordingly
function checkLoginStatus() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    const loginBtn = document.getElementById('admin-login-btn');
    
    if (isLoggedIn) {
        // Update login button
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginBtn.classList.remove('btn-outline-light');
            loginBtn.classList.add('btn-outline-danger');
            loginBtn.title = 'Log out of administrator account';
            
            // Update event listeners
            loginBtn.removeEventListener('click', showLoginModal);
            loginBtn.addEventListener('click', handleLogout);
        }
        
        // Enable admin-only features
        document.querySelectorAll('.requires-login').forEach(element => {
            element.classList.remove('disabled');
            element.removeAttribute('disabled');
            
            // Add subtle highlight to admin features
            if (!element.classList.contains('admin-highlight')) {
                element.classList.add('admin-highlight', 'animate__animated', 'animate__pulse');
                setTimeout(() => {
                    element.classList.remove('animate__pulse');
                }, 1000);
            }
        });
        
        // Hide all permission warnings
        document.querySelectorAll('.permission-warning').forEach(element => {
            element.classList.add('d-none');
        });
        
    } else {
        // Update login button
        if (loginBtn) {
            loginBtn.innerHTML = '<i class="fas fa-user-shield"></i> Admin Login';
            loginBtn.classList.remove('btn-outline-danger');
            loginBtn.classList.add('btn-outline-light');
            loginBtn.title = 'Login as administrator';
            
            // Update event listeners
            loginBtn.removeEventListener('click', handleLogout);
            loginBtn.addEventListener('click', showLoginModal);
        }
        
        // Disable admin-only features
        document.querySelectorAll('.requires-login').forEach(element => {
            element.classList.add('disabled');
            element.setAttribute('disabled', 'disabled');
            element.classList.remove('admin-highlight');
        });
    }
    
    // Log the authentication state
    console.log('Authentication status checked. Admin logged in:', isLoggedIn);
}

// Show login modal
function showLoginModal() {
    // Remove any existing modal backdrops first
    removeModalBackdrops();
    
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
}

// Function to clean up modal backdrops
function removeModalBackdrops() {
    // Remove any lingering backdrop elements
    document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
        backdrop.classList.remove('show');
        backdrop.classList.remove('fade');
        backdrop.remove();
    });
    
    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('padding-right');
}

// Initialize login form
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('login-error');
        
        // Simple validation for demo (In production, this would be server-side)
        if (username === 'admin' && password === 'admin123') {
            localStorage.setItem('adminLoggedIn', 'true');
            
            // Hide the modal
            const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
            loginModal.hide();
            
            // Update login button and UI immediately
            checkLoginStatus();
            
            // Reset any "permission denied" states in the UI
            resetPermissionState();
            
            // Store the original action that required login, if any
            const pendingAction = localStorage.getItem('pendingAdminAction');
            
            // Show success message with animation
            showNotification('Login successful', 'You are now logged in as administrator', 'success');
            
            // Apply an animation to the admin button to highlight the change
            const adminButton = document.getElementById('admin-login-btn');
            if (adminButton) {
                adminButton.classList.add('animate__animated', 'animate__tada');
                setTimeout(() => {
                    adminButton.classList.remove('animate__animated', 'animate__tada');
                }, 1000);
            }
            
            // Log the activity
            logActivity('Admin Login', username, 'Successfully logged in');
            
            // If there was a pending action, execute it after a brief delay
            if (pendingAction) {
                setTimeout(() => {
                    // Clear the pending action
                    localStorage.removeItem('pendingAdminAction');
                    
                    // Execute action based on pendingAction value
                    if (pendingAction === 'addEmployee') {
                        const addModal = new bootstrap.Modal(document.getElementById('addEmployeeModal'));
                        addModal.show();
                    } else if (pendingAction === 'addTask') {
                        const addModal = new bootstrap.Modal(document.getElementById('addTaskModal'));
                        addModal.show();
                    } else if (pendingAction === 'addAnnouncement') {
                        const addModal = new bootstrap.Modal(document.getElementById('addAnnouncementModal'));
                        addModal.show();
                    } else if (pendingAction.startsWith('edit:')) {
                        // For edit actions with parameters, e.g., 'edit:employee:2'
                        const parts = pendingAction.split(':');
                        if (parts.length === 3) {
                            const type = parts[1];
                            const id = parts[2];
                            
                            if (type === 'employee') {
                                editEmployee(parseInt(id));
                            } else if (type === 'task') {
                                editTask(parseInt(id));
                            } else if (type === 'announcement') {
                                editAnnouncement(parseInt(id));
                            }
                        }
                    } else if (pendingAction.startsWith('delete:')) {
                        // For delete actions with parameters, e.g., 'delete:employee:2'
                        const parts = pendingAction.split(':');
                        if (parts.length === 3) {
                            const type = parts[1];
                            const id = parts[2];
                            
                            if (type === 'employee') {
                                showDeleteConfirmation(parseInt(id));
                            } else if (type === 'task') {
                                deleteTask(parseInt(id));
                            } else if (type === 'announcement') {
                                showDeleteConfirmation(parseInt(id));
                            }
                        }
                    } else if (pendingAction.startsWith('complete:')) {
                        // For complete task actions, e.g., 'complete:task:2'
                        const parts = pendingAction.split(':');
                        if (parts.length === 3 && parts[1] === 'task') {
                            const id = parts[2];
                            // Set the data attribute and call quickCompleteTask
                            const quickCompleteBtn = document.getElementById('quickCompleteBtn');
                            if (quickCompleteBtn) {
                                quickCompleteBtn.setAttribute('data-task-index', id);
                                quickCompleteTask();
                            }
                        }
                    }
                }, 800);
            }
        } else {
            // Show error message with animation
            errorElement.textContent = 'Invalid username or password';
            errorElement.classList.remove('d-none');
            errorElement.classList.add('animate__animated', 'animate__shakeX');
            
            // Highlight the incorrect fields
            const usernameField = document.getElementById('username');
            const passwordField = document.getElementById('password');
            
            usernameField.classList.add('is-invalid');
            passwordField.classList.add('is-invalid');
            
            // Remove animation and invalid class after it completes
            setTimeout(() => {
                errorElement.classList.remove('animate__animated', 'animate__shakeX');
                // Focus on username field
                usernameField.focus();
            }, 1000);
            
            // Add event listeners to remove invalid class when typing
            usernameField.addEventListener('input', function() {
                this.classList.remove('is-invalid');
            }, { once: true });
            
            passwordField.addEventListener('input', function() {
                this.classList.remove('is-invalid');
            }, { once: true });
        }
    });
}

// Reset any UI elements that were disabled due to lacking permission
function resetPermissionState() {
    // Re-enable any elements that might have been disabled
    document.querySelectorAll('.requires-login').forEach(element => {
        element.classList.remove('disabled');
        element.removeAttribute('disabled');
    });
    
    // Remove any permission warnings
    document.querySelectorAll('.permission-warning').forEach(element => {
        element.classList.add('d-none');
    });
}

// Handle logout
function handleLogout() {
    localStorage.setItem('adminLoggedIn', 'false');
    
    // Update login button with animation
    const adminButton = document.getElementById('admin-login-btn');
    if (adminButton) {
        adminButton.classList.add('animate__animated', 'animate__tada');
        setTimeout(() => {
            adminButton.classList.remove('animate__animated', 'animate__tada');
            checkLoginStatus();
        }, 500);
    } else {
        checkLoginStatus();
    }
    
    // Show logout message
    showNotification('Logged out', 'You have been logged out successfully', 'info');
    
    // Log the activity
    logActivity('Admin Logout', 'Administrator', 'Successfully logged out');
}

// Show notification with animation
function showNotification(title, message, type = 'info') {
    // Define icon based on notification type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'danger') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `toast align-items-center text-white bg-${type} border-0 animate__animated animate__fadeInUp`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'assertive');
    notification.setAttribute('aria-atomic', 'true');
    
    notification.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${icon} me-2"></i>
                <strong>${title}</strong>: ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
        document.body.appendChild(toastContainer);
    }
    
    // Add to container
    toastContainer.appendChild(notification);
    
    // Show notification
    const toast = new bootstrap.Toast(notification, {
        autohide: true,
        delay: 5000
    });
    toast.show();
    
    // Add a brief animation to highlight the toast after it appears
    setTimeout(() => {
        notification.classList.add('animate__pulse');
        setTimeout(() => {
            notification.classList.remove('animate__pulse');
        }, 1000);
    }, 300);
    
    // Add fade out animation before hiding
    notification.addEventListener('hide.bs.toast', function() {
        notification.classList.remove('animate__fadeInUp');
        notification.classList.add('animate__fadeOutDown');
    });
    
    // Remove after hiding
    notification.addEventListener('hidden.bs.toast', function() {
        notification.remove();
    });
}

// Initialize application data
function initializeAppData() {
    initializeEmployeeData();
    initializeTaskData();
    initializeAnnouncementData();
}

// Initialize default employee data if not available
function initializeEmployeeData() {
    if (!localStorage.getItem('employees')) {
        const defaultEmployees = [
            {
                id: "EMP001",
                name: "Rajesh Patel",
                position: "Senior Officer",
                department: "Administration",
                email: "rajesh.patel@mod-gujarat.gov.in",
                phone: "+91-79-12345678",
                joinDate: "2020-01-15",
                status: "Active",
                address: "Block A, Government Quarters, Gandhinagar, Gujarat"
            },
            {
                id: "EMP002",
                name: "Ananya Sharma",
                position: "Intelligence Analyst",
                department: "Intelligence",
                email: "ananya.sharma@mod-gujarat.gov.in",
                phone: "+91-79-23456789",
                joinDate: "2019-05-20",
                status: "Active",
                address: "Sector 16, Near Military Campus, Gandhinagar, Gujarat"
            },
            {
                id: "EMP003",
                name: "Vivek Desai",
                position: "Communications Expert",
                department: "Communications",
                email: "vivek.desai@mod-gujarat.gov.in",
                phone: "+91-79-34567890",
                joinDate: "2021-03-10",
                status: "Active",
                address: "Defense Colony, Ahmedabad, Gujarat"
            }
        ];
        
        localStorage.setItem('employees', JSON.stringify(defaultEmployees));
        localStorage.setItem('totalEmployees', defaultEmployees.length.toString());
    }
}

// Initialize default task data if not available
function initializeTaskData() {
    if (!localStorage.getItem('tasks')) {
        const defaultTasks = [
            {
                id: "TASK001",
                title: "Security Protocol Review",
                description: "Review and update the department's security protocols according to latest guidelines from central ministry.",
                assignedTo: "Rajesh Patel",
                department: "Administration",
                startDate: "2023-06-01",
                dueDate: "2023-06-15",
                priority: "High",
                status: "In Progress",
                completion: 60
            },
            {
                id: "TASK002",
                title: "Intelligence Report Compilation",
                description: "Compile and analyze intelligence reports from field officers for quarterly briefing.",
                assignedTo: "Ananya Sharma",
                department: "Intelligence",
                startDate: "2023-05-20",
                dueDate: "2023-06-10",
                priority: "Medium",
                status: "In Progress",
                completion: 40
            },
            {
                id: "TASK003",
                title: "Communications Equipment Audit",
                description: "Conduct audit of communications equipment and prepare report of items needing replacement.",
                assignedTo: "Vivek Desai",
                department: "Communications",
                startDate: "2023-05-25",
                dueDate: "2023-06-05",
                priority: "Medium",
                status: "Completed",
                completion: 100
            }
        ];
        
        localStorage.setItem('tasks', JSON.stringify(defaultTasks));
        localStorage.setItem('totalTasks', defaultTasks.length.toString());
        localStorage.setItem('completedTasks', "1");
    }
}

// Initialize default announcement data if not available
function initializeAnnouncementData() {
    if (!localStorage.getItem('announcements')) {
        const currentDate = new Date().toISOString().split('T')[0];
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const nextWeekStr = nextWeek.toISOString().split('T')[0];
        
        const defaultAnnouncements = [
            {
                id: 1,
                title: "Annual Security Briefing",
                content: "All department heads are required to attend the annual security briefing on June 15th, 2023 at the main conference hall. Attendance is mandatory.",
                category: "Meeting",
                priority: "High",
                date: currentDate,
                expiry: nextWeekStr,
                pinned: true,
                archived: false
            },
            {
                id: 2,
                title: "New Communication Protocol Implementation",
                content: "The department will be implementing new secure communication protocols starting next month. Training sessions will be conducted for all staff members.",
                category: "News",
                priority: "Medium",
                date: currentDate,
                expiry: "",
                pinned: false,
                archived: false
            },
            {
                id: 3,
                title: "Independence Day Celebration",
                content: "The ministry will be hosting a special Independence Day celebration on August 15th. All staff members are invited with their families.",
                category: "Event",
                priority: "Low",
                date: currentDate,
                expiry: "",
                pinned: false,
                archived: false
            }
        ];
        
        localStorage.setItem('announcements', JSON.stringify(defaultAnnouncements));
    }
}

// Format date for display
function formatDate(dateString) {
    if (!dateString) return "Not specified";
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
}

// Export to CSV
function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification('Export Failed', 'No data to export', 'danger');
        return;
    }
    
    // Get headers from first object
    const headers = Object.keys(data[0]);
    
    // Convert data to CSV
    let csvContent = headers.join(',') + '\n';
    
    data.forEach(item => {
        const row = headers.map(header => {
            // Handle commas and quotes in the data
            const cell = item[header] != null ? item[header].toString() : '';
            return `"${cell.replace(/"/g, '""')}"`;
        });
        csvContent += row.join(',') + '\n';
    });
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Export Successful', `${filename} has been downloaded`, 'success');
}

// Print content
function printContent(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        showNotification('Print Failed', 'Content not found', 'danger');
        return;
    }
    
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Ministry of Defence - Gujarat</title>
            <link rel="stylesheet" href="https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css">
            <link rel="stylesheet" href="/static/css/styles.css">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    padding: 20px;
                    color: #000;
                    background-color: #fff;
                }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .header { 
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #004080;
                }
                .logo { height: 60px; }
                .print-date {
                    text-align: right;
                    font-size: 12px;
                    margin-bottom: 20px;
                }
                @media print {
                    .no-print { display: none; }
                    body { font-size: 12px; }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Ministry of Defence - Gujarat</h1>
                <p>HOD Department</p>
            </div>
            <div class="print-date">
                Printed on: ${new Date().toLocaleString('en-IN')}
            </div>
            ${element.innerHTML}
            <div class="no-print" style="text-align: center; margin-top: 20px;">
                <button onclick="window.print()">Print Document</button>
                <button onclick="window.close()">Close</button>
            </div>
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
}

// Generate a unique ID
function generateUniqueId(prefix) {
    return prefix + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

// Check if user is logged in, show login modal if not
function requireLogin() {
    console.log('Checking admin login status');
    const isLoggedIn = localStorage.getItem('adminLoggedIn') === 'true';
    
    if (!isLoggedIn) {
        console.log('Login required: User not logged in');
        
        // Get the current URL and add to pending actions
        // This will help with returning to the correct page after login
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        localStorage.setItem('pendingPage', currentPage);
        
        // Store any pending action already in the local storage for debugging
        const existingPendingAction = localStorage.getItem('pendingAdminAction');
        if (existingPendingAction) {
            console.log('Existing pending action found:', existingPendingAction);
        }
        
        // Close any open modals first to prevent overlap issues
        document.querySelectorAll('.modal').forEach(modalEl => {
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) {
                modal.hide();
                console.log('Closed existing modal to prevent overlap');
            }
        });
        
        // Clean up any lingering modal backdrops
        removeModalBackdrops();
        
        // Show login notification
        showNotification('Access Denied', 'Please login as administrator to perform this action', 'warning');
        
        // Show login modal after a short delay
        setTimeout(() => {
            const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            if (loginModal) {
                loginModal.show();
                console.log('Showing login modal');
                
                // Add highlight animation to the login form to draw attention
                const loginForm = document.getElementById('login-form');
                if (loginForm) {
                    loginForm.classList.add('animate__animated', 'animate__headShake');
                    setTimeout(() => {
                        loginForm.classList.remove('animate__animated', 'animate__headShake');
                    }, 1000);
                    
                    // Focus on username field
                    const usernameField = document.getElementById('username');
                    if (usernameField) {
                        usernameField.focus();
                        console.log('Focus set on username field');
                    }
                } else {
                    console.error('Login form not found');
                }
            } else {
                console.error('Login modal not found');
                alert('Error: Login form could not be displayed. Please refresh and try again.');
            }
        }, 500);
        
        return false;
    }
    
    console.log('Login check passed: User is authenticated');
    return true;
}

// Add activity log
function logActivity(action, user = 'Administrator', details = '') {
    if (!localStorage.getItem('activityLog')) {
        localStorage.setItem('activityLog', JSON.stringify([]));
    }
    
    const logs = JSON.parse(localStorage.getItem('activityLog'));
    
    logs.unshift({
        timestamp: new Date().toISOString(),
        action: action,
        user: user,
        details: details
    });
    
    // Keep only the last 100 logs
    if (logs.length > 100) {
        logs.pop();
    }
    
    localStorage.setItem('activityLog', JSON.stringify(logs));
}

// Initialize theme toggle functionality
function initializeThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) {
        console.error('Theme toggle button not found in the DOM');
        return;
    }
    
    console.log('Initializing theme toggle button');
    
    // Check if theme preference is saved
    const savedTheme = localStorage.getItem('theme');
    console.log('Saved theme preference:', savedTheme);
    
    // Apply saved theme preference or default to dark
    if (savedTheme === 'light') {
        setLightTheme();
    } else {
        setDarkTheme();
    }
    
    // Remove any existing event listeners to prevent duplicates
    themeToggle.removeEventListener('click', handleThemeToggle);
    
    // Add new event listener
    themeToggle.addEventListener('click', handleThemeToggle);
    
    // Log that theme toggle is ready
    console.log('Theme toggle initialized successfully');
}

// Handle theme toggle click
function handleThemeToggle() {
    console.log('Theme toggle clicked');
    
    // Get current theme
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    console.log('Current theme:', currentTheme);
    
    // Toggle theme
    if (currentTheme === 'dark') {
        setLightTheme();
    } else {
        setDarkTheme();
    }
    
    // Add animation class to theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.classList.add('animate__animated', 'animate__rubberBand');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            themeToggle.classList.remove('animate__animated', 'animate__rubberBand');
        }, 1000);
    }
    
    // Log theme change
    console.log('Theme changed to:', document.documentElement.getAttribute('data-bs-theme'));
}

// Set light theme
function setLightTheme() {
    document.documentElement.setAttribute('data-bs-theme', 'light');
    
    // Change theme stylesheet
    document.getElementById('theme-stylesheet').href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css';
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        themeToggle.title = 'Switch to Dark Mode';
    }
    
    // Save preference
    localStorage.setItem('theme', 'light');
}

// Set dark theme
function setDarkTheme() {
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    
    // Change theme stylesheet
    document.getElementById('theme-stylesheet').href = 'https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css';
    
    // Update theme toggle icon
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        themeToggle.title = 'Switch to Light Mode';
    }
    
    // Save preference
    localStorage.setItem('theme', 'dark');
}

// Add animation classes to elements
function addAnimationClasses() {
    // Add animation to cards
    document.querySelectorAll('.card').forEach((card, index) => {
        card.classList.add('animate-fadeIn');
        card.style.animationDelay = 0.1 * (index % 5) + 's';
    });
    
    // Add animation to headers
    document.querySelectorAll('h1, h2, h3').forEach((header, index) => {
        header.classList.add('animate-slideInLeft');
        header.style.animationDelay = 0.1 * (index % 3) + 's';
    });
    
    // Add animation to tables
    document.querySelectorAll('table').forEach(table => {
        table.classList.add('animate-zoomIn');
    });
    
    // Add animation to charts
    document.querySelectorAll('canvas').forEach(canvas => {
        canvas.classList.add('animate-fadeIn');
        canvas.style.animationDelay = '0.3s';
    });
    
    // Add floating animation to specific elements
    document.querySelectorAll('.stats-icon, .fas.fa-3x').forEach(icon => {
        icon.classList.add('animate-float');
    });
}
