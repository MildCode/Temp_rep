/**
 * Dashboard JavaScript File
 * Gujarat Ministry of Defence - HOD Department
 * 
 * This file contains functionality for the dashboard page
 */

// Initialize dashboard when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Dashboard page initialized');
    
    // Load dashboard data
    loadDashboardStats();
    
    // Initialize charts
    initializeTaskCompletionChart();
    initializeTaskStatusChart();
    initializeEmployeeProductivityChart();
    initializeTaskPriorityChart();
    initializeDepartmentWorkloadChart();
    
    // Load activity logs
    loadActivityLogs();
    
    // Setup event listeners
    setupEventListeners();
});

// Setup event listeners for dashboard page
function setupEventListeners() {
    // Refresh dashboard button
    const refreshBtn = document.getElementById('refresh-dashboard');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            loadDashboardStats();
            initializeTaskCompletionChart();
            initializeTaskStatusChart();
            initializeEmployeeProductivityChart();
            initializeTaskPriorityChart();
            initializeDepartmentWorkloadChart();
            loadActivityLogs();
            showNotification('Dashboard Refreshed', 'Dashboard data has been updated', 'success');
        });
    }
    
    // Export data button
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
        exportBtn.addEventListener('click', function() {
            exportDashboardData();
        });
    }
    
    // View all activity button
    const viewAllActivityBtn = document.getElementById('view-all-activity');
    if (viewAllActivityBtn) {
        viewAllActivityBtn.addEventListener('click', function() {
            // This would typically open a modal or navigate to a full activity log page
            // For now, we'll just load more logs
            loadActivityLogs(50);
            showNotification('Activity Logs', 'Showing more activity logs', 'info');
        });
    }
}

// Load dashboard statistics
function loadDashboardStats() {
    // Get data from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Calculate stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(employee => employee.status === 'Active').length;
    
    // Update the UI
    document.getElementById('dashboard-total-tasks').textContent = totalTasks;
    document.getElementById('dashboard-completed-tasks').textContent = completedTasks;
    document.getElementById('dashboard-pending-tasks').textContent = pendingTasks + inProgressTasks;
    document.getElementById('dashboard-total-employees').textContent = totalEmployees;
    
    // Calculate percentages and changes
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const pendingPercent = totalTasks > 0 ? Math.round(((pendingTasks + inProgressTasks) / totalTasks) * 100) : 0;
    
    // Random change percentage for demo (in real app, this would be calculated from historical data)
    const taskChange = Math.round((Math.random() * 20) - 10);
    
    // Update stats in the UI
    document.getElementById('task-change').textContent = (taskChange >= 0 ? '+' : '') + taskChange + '%';
    document.getElementById('completion-rate').textContent = completionRate + '%';
    document.getElementById('pending-percent').textContent = pendingPercent + '%';
    document.getElementById('active-employees').textContent = activeEmployees;
    
    // Color coding for change percentages
    if (taskChange > 0) {
        document.getElementById('task-change').className = 'small text-success';
    } else if (taskChange < 0) {
        document.getElementById('task-change').className = 'small text-danger';
    } else {
        document.getElementById('task-change').className = 'small text-muted';
    }
    
    // Save stats to localStorage for reference
    localStorage.setItem('totalTasks', totalTasks.toString());
    localStorage.setItem('completedTasks', completedTasks.toString());
    localStorage.setItem('totalEmployees', totalEmployees.toString());
}

// Initialize task completion trend chart
function initializeTaskCompletionChart() {
    const canvas = document.getElementById('taskCompletionChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Generate last 7 days dates
    const dates = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        dates.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
    }
    
    // Generate random data for completed and assigned tasks
    // In a real application, this would come from your backend
    const completedData = [3, 5, 2, 4, 6, 3, 7];
    const assignedData = [5, 7, 3, 6, 8, 5, 9];
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Tasks Completed',
                    data: completedData,
                    backgroundColor: 'rgba(40, 167, 69, 0.2)',
                    borderColor: 'rgba(40, 167, 69, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Tasks Assigned',
                    data: assignedData,
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Initialize task status distribution chart
function initializeTaskStatusChart() {
    const canvas = document.getElementById('taskStatusChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Count tasks by status
    const statusCounts = {
        'Completed': 0,
        'In Progress': 0,
        'Pending': 0
    };
    
    tasks.forEach(task => {
        if (statusCounts.hasOwnProperty(task.status)) {
            statusCounts[task.status]++;
        }
    });
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',  // Completed - Green
                    'rgba(255, 193, 7, 0.8)',  // In Progress - Yellow
                    'rgba(108, 117, 125, 0.8)' // Pending - Gray
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(108, 117, 125, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize employee productivity chart
function initializeEmployeeProductivityChart() {
    const canvas = document.getElementById('employeeProductivityChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get employees and tasks from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Get top 5 employees by number of completed tasks
    const employeeCompletedTasks = {};
    
    // Initialize counts
    employees.forEach(employee => {
        employeeCompletedTasks[employee.name] = 0;
    });
    
    // Count completed tasks per employee
    tasks.forEach(task => {
        if (task.status === 'Completed' && employeeCompletedTasks.hasOwnProperty(task.assignedTo)) {
            employeeCompletedTasks[task.assignedTo]++;
        }
    });
    
    // Sort employees by task count and get top 5
    const topEmployees = Object.entries(employeeCompletedTasks)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topEmployees.map(entry => entry[0]),
            datasets: [{
                label: 'Completed Tasks',
                data: topEmployees.map(entry => entry[1]),
                backgroundColor: 'rgba(23, 162, 184, 0.8)',
                borderColor: 'rgba(23, 162, 184, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// Initialize task priority distribution chart
function initializeTaskPriorityChart() {
    const canvas = document.getElementById('taskPriorityChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Count tasks by priority
    const priorityCounts = {
        'High': 0,
        'Medium': 0,
        'Low': 0
    };
    
    tasks.forEach(task => {
        if (priorityCounts.hasOwnProperty(task.priority)) {
            priorityCounts[task.priority]++;
        }
    });
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(priorityCounts),
            datasets: [{
                data: Object.values(priorityCounts),
                backgroundColor: [
                    'rgba(220, 53, 69, 0.8)',   // High - Red
                    'rgba(255, 193, 7, 0.8)',   // Medium - Yellow
                    'rgba(40, 167, 69, 0.8)'    // Low - Green
                ],
                borderColor: [
                    'rgba(220, 53, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(40, 167, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize department workload chart
function initializeDepartmentWorkloadChart() {
    const canvas = document.getElementById('departmentWorkloadChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Count tasks by department
    const departmentCounts = {};
    
    tasks.forEach(task => {
        if (!departmentCounts[task.department]) {
            departmentCounts[task.department] = 0;
        }
        departmentCounts[task.department]++;
    });
    
    // Convert to arrays for chart
    const departments = Object.keys(departmentCounts);
    const counts = Object.values(departmentCounts);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    
    // Generate colors based on number of departments
    const colors = generateColors(departments.length);
    
    canvas.chart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: departments,
            datasets: [{
                data: counts,
                backgroundColor: colors.map(color => color.bg),
                borderColor: colors.map(color => color.border),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        boxWidth: 12
                    }
                }
            }
        }
    });
}

// Load activity logs
function loadActivityLogs(limit = 10) {
    const activityLogElement = document.getElementById('activity-log');
    if (!activityLogElement) return;
    
    // Get logs from localStorage
    const logs = JSON.parse(localStorage.getItem('activityLog')) || [];
    
    // Create HTML for logs
    if (logs.length === 0) {
        activityLogElement.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-history fa-3x mb-3"></i>
                        <p>No activity data available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Show latest logs up to the limit
    const recentLogs = logs.slice(0, limit);
    
    let html = '';
    recentLogs.forEach(log => {
        const date = new Date(log.timestamp);
        
        html += `
            <tr>
                <td>${log.action}</td>
                <td>${log.user}</td>
                <td>${date.toLocaleString('en-IN')}</td>
                <td>
                    <button class="btn btn-sm btn-outline-info view-log-btn" data-log-id="${logs.indexOf(log)}">
                        <i class="fas fa-eye"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    activityLogElement.innerHTML = html;
    
    // Add event listeners to view buttons
    const viewButtons = activityLogElement.querySelectorAll('.view-log-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const logId = this.getAttribute('data-log-id');
            viewActivityLogDetails(logs[logId]);
        });
    });
}

// View activity log details
function viewActivityLogDetails(log) {
    // This would typically show a modal with the log details
    // For now, let's use an alert
    alert(`
Action: ${log.action}
User: ${log.user}
Time: ${new Date(log.timestamp).toLocaleString('en-IN')}
Details: ${log.details || 'No additional details'}
    `);
}

// Generate colors for charts
function generateColors(count) {
    const baseColors = [
        { bg: 'rgba(0, 123, 255, 0.7)', border: 'rgba(0, 123, 255, 1)' },
        { bg: 'rgba(40, 167, 69, 0.7)', border: 'rgba(40, 167, 69, 1)' },
        { bg: 'rgba(220, 53, 69, 0.7)', border: 'rgba(220, 53, 69, 1)' },
        { bg: 'rgba(255, 193, 7, 0.7)', border: 'rgba(255, 193, 7, 1)' },
        { bg: 'rgba(23, 162, 184, 0.7)', border: 'rgba(23, 162, 184, 1)' },
        { bg: 'rgba(111, 66, 193, 0.7)', border: 'rgba(111, 66, 193, 1)' },
        { bg: 'rgba(102, 16, 242, 0.7)', border: 'rgba(102, 16, 242, 1)' },
        { bg: 'rgba(253, 126, 20, 0.7)', border: 'rgba(253, 126, 20, 1)' }
    ];
    
    // If we need more colors than in our base set, generate them
    const colors = [...baseColors];
    
    while (colors.length < count) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        
        colors.push({
            bg: `rgba(${r}, ${g}, ${b}, 0.7)`,
            border: `rgba(${r}, ${g}, ${b}, 1)`
        });
    }
    
    return colors.slice(0, count);
}

// Export dashboard data as CSV
function exportDashboardData() {
    // Get data from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Create dashboard summary
    const dashboardSummary = [
        {
            Category: 'Tasks',
            Total: tasks.length,
            Completed: tasks.filter(task => task.status === 'Completed').length,
            InProgress: tasks.filter(task => task.status === 'In Progress').length,
            Pending: tasks.filter(task => task.status === 'Pending').length
        },
        {
            Category: 'Employees',
            Total: employees.length,
            Active: employees.filter(emp => emp.status === 'Active').length,
            OnLeave: employees.filter(emp => emp.status === 'On Leave').length,
            Other: employees.filter(emp => !['Active', 'On Leave'].includes(emp.status)).length
        },
        {
            Category: 'Task Priority',
            Total: tasks.length,
            High: tasks.filter(task => task.priority === 'High').length,
            Medium: tasks.filter(task => task.priority === 'Medium').length,
            Low: tasks.filter(task => task.priority === 'Low').length
        }
    ];
    
    // Export to CSV
    exportToCSV(dashboardSummary, 'dashboard_summary.csv');
}
