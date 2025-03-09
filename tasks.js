/**
 * Tasks JavaScript File
 * Gujarat Ministry of Defence - HOD Department
 * 
 * This file contains functionality for task management
 */

// Initialize tasks page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Tasks page initialized');
    
    // Load task data
    loadTasksData();
    
    // Update task overview
    updateTaskOverview();
    
    // Populate employee dropdown lists
    populateEmployeeDropdowns();
    
    // Setup event listeners
    setupTasksEventListeners();
});

// Setup event listeners for tasks page
function setupTasksEventListeners() {
    // Add task form submit
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', addTask);
    }
    
    // Update task form submit
    const updateTaskBtn = document.getElementById('updateTaskBtn');
    if (updateTaskBtn) {
        updateTaskBtn.addEventListener('click', updateTask);
    }
    
    // Delete task button
    const deleteTaskBtn = document.getElementById('deleteTaskBtn');
    if (deleteTaskBtn) {
        deleteTaskBtn.addEventListener('click', function() {
            const taskIndex = document.getElementById('editTaskIndex').value;
            deleteTask(taskIndex);
        });
    }
    
    // Quick complete task
    const quickCompleteBtn = document.getElementById('quickCompleteBtn');
    if (quickCompleteBtn) {
        quickCompleteBtn.addEventListener('click', quickCompleteTask);
    }
    
    // Search tasks
    const taskSearchBtn = document.getElementById('taskSearchBtn');
    if (taskSearchBtn) {
        taskSearchBtn.addEventListener('click', searchTasks);
    }
    
    // Search on enter key
    const taskSearch = document.getElementById('taskSearch');
    if (taskSearch) {
        taskSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchTasks();
            }
        });
    }
    
    // Export tasks
    const exportTasksBtn = document.getElementById('exportTasks');
    if (exportTasksBtn) {
        exportTasksBtn.addEventListener('click', exportTasksData);
    }
    
    // Print tasks
    const printTasksBtn = document.getElementById('printTasks');
    if (printTasksBtn) {
        printTasksBtn.addEventListener('click', function() {
            printContent('allTasksTable');
        });
    }
    
    // Show task statistics
    const viewTaskStatsBtn = document.getElementById('viewTaskStatsBtn');
    if (viewTaskStatsBtn) {
        viewTaskStatsBtn.addEventListener('click', showTaskStatistics);
    }
    
    // Show filter modal
    const filterTasksBtn = document.getElementById('filterTasksBtn');
    if (filterTasksBtn) {
        filterTasksBtn.addEventListener('click', function() {
            removeModalBackdrops();
            const filterModal = new bootstrap.Modal(document.getElementById('filterTasksModal'));
            filterModal.show();
            
            // Populate employee filter dropdown
            populateEmployeeFilterDropdown();
        });
    }
    
    // Apply filters
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
        applyFilterBtn.addEventListener('click', applyTaskFilters);
    }
    
    // Reset filters
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
        resetFilterBtn.addEventListener('click', resetTaskFilters);
    }
    
    // Completion slider in edit form
    const completionSlider = document.getElementById('editTaskCompletion');
    if (completionSlider) {
        completionSlider.addEventListener('input', function() {
            document.getElementById('completionValue').textContent = this.value;
        });
    }
    
    // Task tab change events
    const taskTabs = document.querySelectorAll('#taskTabs button');
    if (taskTabs.length > 0) {
        taskTabs.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(e) {
                // Refresh the specific tab content
                const targetId = e.target.getAttribute('data-bs-target');
                if (targetId === '#pending-tasks') {
                    loadPendingTasks();
                } else if (targetId === '#progress-tasks') {
                    loadInProgressTasks();
                } else if (targetId === '#completed-tasks') {
                    loadCompletedTasks();
                }
            });
        });
    }
}

// Load tasks data and populate the table
function loadTasksData() {
    const allTasksListElement = document.getElementById('allTasksList');
    const taskCountElement = document.getElementById('taskCount');
    
    if (!allTasksListElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Update task count
    if (taskCountElement) {
        taskCountElement.textContent = tasks.length;
    }
    
    // If no tasks, show message
    if (tasks.length === 0) {
        allTasksListElement.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-tasks fa-3x mb-3"></i>
                        <p>No tasks found</p>
                        <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addTaskModal">
                            <i class="fas fa-plus"></i> Create New Task
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // Also update the pending, in progress, and completed tasks sections
        document.getElementById('pendingTasksList').innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-hourglass-start fa-3x mb-3"></i>
                    <p>No pending tasks</p>
                </div>
            </div>
        `;
        
        document.getElementById('progressTasksList').innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-spinner fa-3x mb-3"></i>
                    <p>No in-progress tasks</p>
                </div>
            </div>
        `;
        
        document.getElementById('completedTasksList').innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-check-circle fa-3x mb-3"></i>
                    <p>No completed tasks</p>
                </div>
            </div>
        `;
        
        return;
    }
    
    // Generate HTML for tasks table
    let html = '';
    
    tasks.forEach((task, index) => {
        // Determine status class
        let statusClass = '';
        switch (task.status) {
            case 'Completed':
                statusClass = 'success';
                break;
            case 'In Progress':
                statusClass = 'warning';
                break;
            case 'Pending':
                statusClass = 'secondary';
                break;
            default:
                statusClass = 'secondary';
        }
        
        // Determine priority class
        let priorityClass = '';
        switch (task.priority) {
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
        
        // Format dates
        const formattedDueDate = formatDate(task.dueDate);
        
        html += `
            <tr>
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.assignedTo}</td>
                <td>${formattedDueDate}</td>
                <td><span class="badge bg-${priorityClass}">${task.priority}</span></td>
                <td><span class="badge bg-${statusClass}">${task.status}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-task-btn" data-task-index="${index}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning edit-task-btn" data-task-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-task-btn" data-task-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    allTasksListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addTaskButtonEventListeners();
    
    // Load task cards for each status
    loadPendingTasks();
    loadInProgressTasks();
    loadCompletedTasks();
}

// Load pending tasks as cards
function loadPendingTasks() {
    const pendingTasksListElement = document.getElementById('pendingTasksList');
    if (!pendingTasksListElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Filter pending tasks
    const pendingTasks = tasks.filter(task => task.status === 'Pending');
    
    // If no pending tasks, show message
    if (pendingTasks.length === 0) {
        pendingTasksListElement.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-hourglass-start fa-3x mb-3"></i>
                    <p>No pending tasks</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate HTML for pending tasks cards
    let html = '';
    
    pendingTasks.forEach((task, index) => {
        // Find the original index in the full array
        const originalIndex = tasks.findIndex(t => t.id === task.id);
        
        // Determine priority class
        let priorityClass = '';
        switch (task.priority) {
            case 'High':
                priorityClass = 'task-priority-high';
                break;
            case 'Medium':
                priorityClass = 'task-priority-medium';
                break;
            case 'Low':
                priorityClass = 'task-priority-low';
                break;
        }
        
        html += `
            <div class="col">
                <div class="card task-card mb-3 ${priorityClass}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${task.title}</h6>
                        <span class="badge bg-secondary">${task.id}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text small">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-user me-1"></i> ${task.assignedTo}</span>
                            <span><i class="fas fa-calendar-alt me-1"></i> ${formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <span class="badge bg-${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}">${task.priority}</span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-task-btn" data-task-index="${originalIndex}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning edit-task-btn" data-task-index="${originalIndex}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    pendingTasksListElement.innerHTML = html;
    
    // Add event listeners to the buttons in pending tasks
    const viewButtons = pendingTasksListElement.querySelectorAll('.view-task-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            viewTask(taskIndex);
        });
    });
    
    const editButtons = pendingTasksListElement.querySelectorAll('.edit-task-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            editTask(taskIndex);
        });
    });
}

// Load in-progress tasks as cards
function loadInProgressTasks() {
    const progressTasksListElement = document.getElementById('progressTasksList');
    if (!progressTasksListElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Filter in-progress tasks
    const progressTasks = tasks.filter(task => task.status === 'In Progress');
    
    // If no in-progress tasks, show message
    if (progressTasks.length === 0) {
        progressTasksListElement.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-spinner fa-3x mb-3"></i>
                    <p>No in-progress tasks</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate HTML for in-progress tasks cards
    let html = '';
    
    progressTasks.forEach((task, index) => {
        // Find the original index in the full array
        const originalIndex = tasks.findIndex(t => t.id === task.id);
        
        // Determine priority class
        let priorityClass = '';
        switch (task.priority) {
            case 'High':
                priorityClass = 'task-priority-high';
                break;
            case 'Medium':
                priorityClass = 'task-priority-medium';
                break;
            case 'Low':
                priorityClass = 'task-priority-low';
                break;
        }
        
        // Calculate progress
        const progress = task.completion || 0;
        
        html += `
            <div class="col">
                <div class="card task-card mb-3 ${priorityClass}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${task.title}</h6>
                        <span class="badge bg-warning">${task.id}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text small">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span><i class="fas fa-user me-1"></i> ${task.assignedTo}</span>
                            <span><i class="fas fa-calendar-alt me-1"></i> ${formatDate(task.dueDate)}</span>
                        </div>
                        <div class="progress" style="height: 10px;">
                            <div class="progress-bar bg-warning" role="progressbar" style="width: ${progress}%;" aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100"></div>
                        </div>
                        <div class="text-end small mt-1">${progress}% complete</div>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <span class="badge bg-${task.priority === 'High' ? 'danger' : task.priority === 'Medium' ? 'warning' : 'success'}">${task.priority}</span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-task-btn" data-task-index="${originalIndex}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-warning edit-task-btn" data-task-index="${originalIndex}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    progressTasksListElement.innerHTML = html;
    
    // Add event listeners to the buttons in in-progress tasks
    const viewButtons = progressTasksListElement.querySelectorAll('.view-task-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            viewTask(taskIndex);
        });
    });
    
    const editButtons = progressTasksListElement.querySelectorAll('.edit-task-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            editTask(taskIndex);
        });
    });
}

// Load completed tasks as cards
function loadCompletedTasks() {
    const completedTasksListElement = document.getElementById('completedTasksList');
    if (!completedTasksListElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Filter completed tasks
    const completedTasks = tasks.filter(task => task.status === 'Completed');
    
    // If no completed tasks, show message
    if (completedTasks.length === 0) {
        completedTasksListElement.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="text-muted">
                    <i class="fas fa-check-circle fa-3x mb-3"></i>
                    <p>No completed tasks</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Generate HTML for completed tasks cards
    let html = '';
    
    completedTasks.forEach((task, index) => {
        // Find the original index in the full array
        const originalIndex = tasks.findIndex(t => t.id === task.id);
        
        // Determine priority class
        let priorityClass = '';
        switch (task.priority) {
            case 'High':
                priorityClass = 'task-priority-high';
                break;
            case 'Medium':
                priorityClass = 'task-priority-medium';
                break;
            case 'Low':
                priorityClass = 'task-priority-low';
                break;
        }
        
        html += `
            <div class="col">
                <div class="card task-card mb-3 ${priorityClass}">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h6 class="mb-0">${task.title}</h6>
                        <span class="badge bg-success">${task.id}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text small">${task.description.substring(0, 100)}${task.description.length > 100 ? '...' : ''}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span><i class="fas fa-user me-1"></i> ${task.assignedTo}</span>
                            <span><i class="fas fa-calendar-check me-1"></i> ${formatDate(task.dueDate)}</span>
                        </div>
                    </div>
                    <div class="card-footer d-flex justify-content-between align-items-center">
                        <span><i class="fas fa-check-circle text-success me-1"></i> Completed</span>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary view-task-btn" data-task-index="${originalIndex}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    completedTasksListElement.innerHTML = html;
    
    // Add event listeners to the view buttons in completed tasks
    const viewButtons = completedTasksListElement.querySelectorAll('.view-task-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            viewTask(taskIndex);
        });
    });
}

// Add event listeners to task action buttons
function addTaskButtonEventListeners() {
    // View task buttons
    const viewButtons = document.querySelectorAll('#allTasksList .view-task-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            viewTask(taskIndex);
        });
    });
    
    // Edit task buttons
    const editButtons = document.querySelectorAll('#allTasksList .edit-task-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            editTask(taskIndex);
        });
    });
    
    // Delete task buttons
    const deleteButtons = document.querySelectorAll('#allTasksList .delete-task-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const taskIndex = this.getAttribute('data-task-index');
            deleteTask(taskIndex);
        });
    });
}

// Update task overview section
function updateTaskOverview() {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Count tasks by status
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pending').length;
    
    // Update counters
    document.getElementById('total-task-count').textContent = totalTasks;
    document.getElementById('completed-task-count').textContent = completedTasks;
    document.getElementById('progress-task-count').textContent = inProgressTasks;
    document.getElementById('pending-task-count').textContent = pendingTasks;
    
    // Update progress bars
    if (totalTasks > 0) {
        const completedPercent = Math.round((completedTasks / totalTasks) * 100);
        const inProgressPercent = Math.round((inProgressTasks / totalTasks) * 100);
        const pendingPercent = Math.round((pendingTasks / totalTasks) * 100);
        
        document.getElementById('completed-task-progress').style.width = completedPercent + '%';
        document.getElementById('progress-task-progress').style.width = inProgressPercent + '%';
        document.getElementById('pending-task-progress').style.width = pendingPercent + '%';
    } else {
        document.getElementById('completed-task-progress').style.width = '0%';
        document.getElementById('progress-task-progress').style.width = '0%';
        document.getElementById('pending-task-progress').style.width = '0%';
    }
    
    // Update localStorage for dashboard reference
    localStorage.setItem('totalTasks', totalTasks.toString());
    localStorage.setItem('completedTasks', completedTasks.toString());
}

// Populate employee dropdowns in task forms
function populateEmployeeDropdowns() {
    const taskAssigneeDropdown = document.getElementById('taskAssignee');
    const editTaskAssigneeDropdown = document.getElementById('editTaskAssignee');
    
    if (!taskAssigneeDropdown && !editTaskAssigneeDropdown) return;
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Filter active employees
    const activeEmployees = employees.filter(employee => employee.status === 'Active');
    
    // Generate HTML options
    let options = '<option value="">Select Employee</option>';
    activeEmployees.forEach(employee => {
        options += `<option value="${employee.name}">${employee.name} (${employee.department})</option>`;
    });
    
    // Add "Unassigned" option
    options += '<option value="Unassigned">Unassigned</option>';
    
    // Update dropdowns
    if (taskAssigneeDropdown) {
        taskAssigneeDropdown.innerHTML = options;
    }
    
    if (editTaskAssigneeDropdown) {
        editTaskAssigneeDropdown.innerHTML = options;
    }
}

// Populate employee filter dropdown
function populateEmployeeFilterDropdown() {
    const filterAssigneeDropdown = document.getElementById('filterAssignee');
    if (!filterAssigneeDropdown) return;
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Generate HTML options
    let options = '<option value="">All Employees</option>';
    employees.forEach(employee => {
        options += `<option value="${employee.name}">${employee.name}</option>`;
    });
    
    // Add "Unassigned" option
    options += '<option value="Unassigned">Unassigned</option>';
    
    // Update dropdown
    filterAssigneeDropdown.innerHTML = options;
}

// View task details
function viewTask(index) {
    // Check if index is valid
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (index < 0 || index >= tasks.length) {
        showNotification('Error', 'Task not found', 'danger');
        return;
    }
    
    const task = tasks[index];
    
    // Populate the view modal
    document.getElementById('viewTaskTitle').textContent = task.title;
    document.getElementById('viewTaskId').textContent = task.id;
    document.getElementById('viewTaskDescription').textContent = task.description;
    document.getElementById('viewTaskAssignee').textContent = task.assignedTo;
    document.getElementById('viewTaskDepartment').textContent = task.department;
    document.getElementById('viewTaskPriority').textContent = task.priority;
    document.getElementById('viewTaskStatus').textContent = task.status;
    document.getElementById('viewTaskStartDate').textContent = formatDate(task.startDate);
    document.getElementById('viewTaskDueDate').textContent = formatDate(task.dueDate);
    
    // Determine priority class for badges
    let priorityClass = '';
    switch (task.priority) {
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
    
    // Update priority badge
    document.getElementById('viewTaskPriority').className = `badge bg-${priorityClass}`;
    
    // Determine status class for badges
    let statusClass = '';
    switch (task.status) {
        case 'Completed':
            statusClass = 'success';
            break;
        case 'In Progress':
            statusClass = 'warning';
            break;
        case 'Pending':
            statusClass = 'secondary';
            break;
        default:
            statusClass = 'secondary';
    }
    
    // Update status badge
    document.getElementById('viewTaskStatus').className = `badge bg-${statusClass}`;
    
    // Update progress bar
    const completion = task.completion || 0;
    const progressBar = document.getElementById('viewTaskProgress');
    progressBar.style.width = completion + '%';
    progressBar.textContent = completion + '%';
    
    // Set progress bar color
    if (completion < 25) {
        progressBar.className = 'progress-bar bg-danger';
    } else if (completion < 75) {
        progressBar.className = 'progress-bar bg-warning';
    } else {
        progressBar.className = 'progress-bar bg-success';
    }
    
    // Show/hide quick complete button based on status
    const quickCompleteBtn = document.getElementById('quickCompleteBtn');
    if (task.status === 'Completed') {
        quickCompleteBtn.style.display = 'none';
    } else {
        quickCompleteBtn.style.display = 'block';
        
        // Store task index for quick complete functionality
        quickCompleteBtn.setAttribute('data-task-index', index);
    }
    
    // Show appropriate alert based on task status and due date
    const alertElement = document.getElementById('viewTaskAlert');
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    
    if (task.status === 'Completed') {
        alertElement.className = 'alert alert-success';
        alertElement.innerHTML = '<i class="fas fa-check-circle"></i> This task has been completed.';
    } else if (dueDate < today) {
        alertElement.className = 'alert alert-danger';
        alertElement.innerHTML = '<i class="fas fa-exclamation-circle"></i> This task is overdue.';
    } else if (dueDate.setDate(dueDate.getDate() - 3) <= today) {
        alertElement.className = 'alert alert-warning';
        alertElement.innerHTML = '<i class="fas fa-exclamation-triangle"></i> This task is due soon.';
    } else {
        alertElement.className = 'alert alert-info';
        alertElement.innerHTML = '<i class="fas fa-info-circle"></i> This task is on schedule.';
    }
    
    // Set up edit button
    const editBtn = document.getElementById('taskEditBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Hide view modal
            const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewTaskModal'));
            viewModal.hide();
            
            // Show edit modal
            editTask(index);
        });
    }
    
    // Show the modal
    removeModalBackdrops();
    const viewModal = new bootstrap.Modal(document.getElementById('viewTaskModal'));
    viewModal.show();
}

// Edit task
function editTask(index) {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', `edit:task:${index}`);
        return;
    }
    
    // Check if index is valid
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    if (index < 0 || index >= tasks.length) {
        showNotification('Error', 'Task not found', 'danger');
        return;
    }
    
    const task = tasks[index];
    
    // Populate the edit form
    document.getElementById('editTaskIndex').value = index;
    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskTitle').value = task.title;
    document.getElementById('editTaskDescription').value = task.description;
    document.getElementById('editTaskAssignee').value = task.assignedTo;
    document.getElementById('editTaskDepartment').value = task.department;
    document.getElementById('editTaskStartDate').value = task.startDate;
    document.getElementById('editTaskDueDate').value = task.dueDate;
    document.getElementById('editTaskPriority').value = task.priority;
    document.getElementById('editTaskStatus').value = task.status;
    document.getElementById('editTaskCompletion').value = task.completion || 0;
    document.getElementById('completionValue').textContent = task.completion || 0;
    
    // Clean up any modal backdrops and show the modal
    removeModalBackdrops();
    const editModal = new bootstrap.Modal(document.getElementById('editTaskModal'));
    editModal.show();
}

// Quick complete a task
function quickCompleteTask() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        const index = document.getElementById('quickCompleteBtn').getAttribute('data-task-index');
        localStorage.setItem('pendingAdminAction', `complete:task:${index}`);
        return;
    }
    
    // Get task index
    const index = document.getElementById('quickCompleteBtn').getAttribute('data-task-index');
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Check if index is valid
    if (index < 0 || index >= tasks.length) {
        showNotification('Error', 'Task not found', 'danger');
        return;
    }
    
    // Update task status
    tasks[index].status = 'Completed';
    tasks[index].completion = 100;
    
    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Log the activity
    logActivity('Completed task', 'Administrator', `Completed task ${tasks[index].title} (${tasks[index].id})`);
    
    // Hide the modal
    const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewTaskModal'));
    viewModal.hide();
    
    // Reload tasks data
    loadTasksData();
    
    // Update task overview
    updateTaskOverview();
    
    // Show success message
    showNotification('Success', 'Task marked as completed', 'success');
}

// Add new task
function addTask() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', 'addTask');
        return;
    }
    
    // Get form values
    const id = document.getElementById('taskId').value;
    const title = document.getElementById('taskTitle').value;
    const description = document.getElementById('taskDescription').value;
    const assignedTo = document.getElementById('taskAssignee').value;
    const department = document.getElementById('taskDepartment').value;
    const startDate = document.getElementById('taskStartDate').value;
    const dueDate = document.getElementById('taskDueDate').value;
    const priority = document.getElementById('taskPriority').value;
    const status = document.getElementById('taskStatus').value;
    
    // Basic validation
    if (!id || !title || !description || !assignedTo || !department || !startDate || !dueDate || !priority || !status) {
        showNotification('Error', 'Please fill in all required fields', 'danger');
        return;
    }
    
    // Create task object
    const newTask = {
        id,
        title,
        description,
        assignedTo,
        department,
        startDate,
        dueDate,
        priority,
        status,
        completion: status === 'Completed' ? 100 : status === 'In Progress' ? 50 : 0
    };
    
    // Get existing tasks
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Check if ID already exists
    if (tasks.some(task => task.id === id)) {
        showNotification('Error', 'Task ID already exists', 'danger');
        return;
    }
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Log the activity
    logActivity('Added task', 'Administrator', `Added task ${title} (${id})`);
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
    modal.hide();
    
    // Reset the form
    document.getElementById('addTaskForm').reset();
    
    // Reload tasks data
    loadTasksData();
    
    // Update task overview
    updateTaskOverview();
    
    // Show success message
    showNotification('Success', 'Task added successfully', 'success');
}

// Update existing task
function updateTask() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        const index = document.getElementById('editTaskIndex').value;
        localStorage.setItem('pendingAdminAction', `edit:task:${index}`);
        return;
    }
    
    // Get form values
    const index = document.getElementById('editTaskIndex').value;
    const id = document.getElementById('editTaskId').value;
    const title = document.getElementById('editTaskTitle').value;
    const description = document.getElementById('editTaskDescription').value;
    const assignedTo = document.getElementById('editTaskAssignee').value;
    const department = document.getElementById('editTaskDepartment').value;
    const startDate = document.getElementById('editTaskStartDate').value;
    const dueDate = document.getElementById('editTaskDueDate').value;
    const priority = document.getElementById('editTaskPriority').value;
    const status = document.getElementById('editTaskStatus').value;
    const completion = document.getElementById('editTaskCompletion').value;
    
    // Basic validation
    if (!id || !title || !description || !assignedTo || !department || !startDate || !dueDate || !priority || !status) {
        showNotification('Error', 'Please fill in all required fields', 'danger');
        return;
    }
    
    // Get existing tasks
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Check if index is valid
    if (index < 0 || index >= tasks.length) {
        showNotification('Error', 'Task not found', 'danger');
        return;
    }
    
    // Update task
    tasks[index] = {
        id,
        title,
        description,
        assignedTo,
        department,
        startDate,
        dueDate,
        priority,
        status,
        completion: parseInt(completion)
    };
    
    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Log the activity
    logActivity('Updated task', 'Administrator', `Updated task ${title} (${id})`);
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
    modal.hide();
    
    // Reload tasks data
    loadTasksData();
    
    // Update task overview
    updateTaskOverview();
    
    // Show success message
    showNotification('Success', 'Task updated successfully', 'success');
}

// Delete task
function deleteTask(index) {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', `delete:task:${index}`);
        return;
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Check if index is valid
    if (index < 0 || index >= tasks.length) {
        showNotification('Error', 'Task not found', 'danger');
        return;
    }
    
    // Store task details for logging
    const task = tasks[index];
    
    // Confirm before deleting
    if (!confirm(`Are you sure you want to delete the task "${task.title}" (${task.id})?`)) {
        return;
    }
    
    // Remove the task
    tasks.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('tasks', JSON.stringify(tasks));
    
    // Log the activity
    logActivity('Deleted task', 'Administrator', `Deleted task ${task.title} (${task.id})`);
    
    // Hide the modal if open
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
    if (editModal) editModal.hide();
    
    // Reload tasks data
    loadTasksData();
    
    // Update task overview
    updateTaskOverview();
    
    // Show success message
    showNotification('Success', 'Task deleted successfully', 'success');
}

// Search tasks
function searchTasks() {
    const searchTerm = document.getElementById('taskSearch').value.toLowerCase();
    
    // If search term is empty, load all tasks
    if (!searchTerm.trim()) {
        loadTasksData();
        return;
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Filter tasks by search term
    const filteredTasks = tasks.filter(task => {
        return (
            task.id.toLowerCase().includes(searchTerm) ||
            task.title.toLowerCase().includes(searchTerm) ||
            task.description.toLowerCase().includes(searchTerm) ||
            task.assignedTo.toLowerCase().includes(searchTerm) ||
            task.department.toLowerCase().includes(searchTerm)
        );
    });
    
    // Update task count
    const taskCountElement = document.getElementById('taskCount');
    if (taskCountElement) {
        taskCountElement.textContent = filteredTasks.length;
    }
    
    // Get the table body element
    const allTasksListElement = document.getElementById('allTasksList');
    if (!allTasksListElement) return;
    
    // If no matching tasks, show message
    if (filteredTasks.length === 0) {
        allTasksListElement.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-search fa-3x mb-3"></i>
                        <p>No tasks found matching "${searchTerm}"</p>
                        <button class="btn btn-outline-secondary mt-2" onclick="loadTasksData()">
                            <i class="fas fa-sync-alt"></i> Show All Tasks
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Generate HTML for filtered tasks
    let html = '';
    
    filteredTasks.forEach((task, filteredIndex) => {
        // Find the original index in the full array
        const originalIndex = tasks.findIndex(t => t.id === task.id);
        
        // Determine status class
        let statusClass = '';
        switch (task.status) {
            case 'Completed':
                statusClass = 'success';
                break;
            case 'In Progress':
                statusClass = 'warning';
                break;
            case 'Pending':
                statusClass = 'secondary';
                break;
            default:
                statusClass = 'secondary';
        }
        
        // Determine priority class
        let priorityClass = '';
        switch (task.priority) {
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
        
        // Format dates
        const formattedDueDate = formatDate(task.dueDate);
        
        html += `
            <tr>
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.assignedTo}</td>
                <td>${formattedDueDate}</td>
                <td><span class="badge bg-${priorityClass}">${task.priority}</span></td>
                <td><span class="badge bg-${statusClass}">${task.status}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-task-btn" data-task-index="${originalIndex}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning edit-task-btn" data-task-index="${originalIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-task-btn" data-task-index="${originalIndex}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    allTasksListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addTaskButtonEventListeners();
    
    // Show notification
    showNotification('Search Results', `Found ${filteredTasks.length} tasks matching "${searchTerm}"`, 'info');
}

// Apply task filters
function applyTaskFilters() {
    // Get filter values
    const statusFilters = [];
    if (document.getElementById('filterPending').checked) statusFilters.push('Pending');
    if (document.getElementById('filterInProgress').checked) statusFilters.push('In Progress');
    if (document.getElementById('filterCompleted').checked) statusFilters.push('Completed');
    
    const priorityFilters = [];
    if (document.getElementById('filterHigh').checked) priorityFilters.push('High');
    if (document.getElementById('filterMedium').checked) priorityFilters.push('Medium');
    if (document.getElementById('filterLow').checked) priorityFilters.push('Low');
    
    const departmentFilter = document.getElementById('filterDepartment').value;
    const assigneeFilter = document.getElementById('filterAssignee').value;
    const startDateFilter = document.getElementById('filterStartDate').value;
    const endDateFilter = document.getElementById('filterEndDate').value;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Apply filters
    const filteredTasks = tasks.filter(task => {
        // Status filter
        if (statusFilters.length > 0 && !statusFilters.includes(task.status)) {
            return false;
        }
        
        // Priority filter
        if (priorityFilters.length > 0 && !priorityFilters.includes(task.priority)) {
            return false;
        }
        
        // Department filter
        if (departmentFilter && task.department !== departmentFilter) {
            return false;
        }
        
        // Assignee filter
        if (assigneeFilter && task.assignedTo !== assigneeFilter) {
            return false;
        }
        
        // Date filters
        if (startDateFilter && new Date(task.startDate) < new Date(startDateFilter)) {
            return false;
        }
        
        if (endDateFilter && new Date(task.dueDate) > new Date(endDateFilter)) {
            return false;
        }
        
        return true;
    });
    
    // Update task count
    const taskCountElement = document.getElementById('taskCount');
    if (taskCountElement) {
        taskCountElement.textContent = filteredTasks.length;
    }
    
    // Get the table body element
    const allTasksListElement = document.getElementById('allTasksList');
    if (!allTasksListElement) return;
    
    // If no matching tasks, show message
    if (filteredTasks.length === 0) {
        allTasksListElement.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-filter fa-3x mb-3"></i>
                        <p>No tasks match the selected filters</p>
                        <button class="btn btn-outline-secondary mt-2" id="resetFiltersBtn">
                            <i class="fas fa-sync-alt"></i> Reset Filters
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        // Add event listener to reset button
        document.getElementById('resetFiltersBtn').addEventListener('click', resetTaskFilters);
        return;
    }
    
    // Generate HTML for filtered tasks
    let html = '';
    
    filteredTasks.forEach((task, filteredIndex) => {
        // Find the original index in the full array
        const originalIndex = tasks.findIndex(t => t.id === task.id);
        
        // Determine status class
        let statusClass = '';
        switch (task.status) {
            case 'Completed':
                statusClass = 'success';
                break;
            case 'In Progress':
                statusClass = 'warning';
                break;
            case 'Pending':
                statusClass = 'secondary';
                break;
            default:
                statusClass = 'secondary';
        }
        
        // Determine priority class
        let priorityClass = '';
        switch (task.priority) {
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
        
        // Format dates
        const formattedDueDate = formatDate(task.dueDate);
        
        html += `
            <tr>
                <td>${task.id}</td>
                <td>${task.title}</td>
                <td>${task.assignedTo}</td>
                <td>${formattedDueDate}</td>
                <td><span class="badge bg-${priorityClass}">${task.priority}</span></td>
                <td><span class="badge bg-${statusClass}">${task.status}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-task-btn" data-task-index="${originalIndex}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning edit-task-btn" data-task-index="${originalIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-task-btn" data-task-index="${originalIndex}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    allTasksListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addTaskButtonEventListeners();
    
    // Hide the filter modal
    const filterModal = bootstrap.Modal.getInstance(document.getElementById('filterTasksModal'));
    if (filterModal) filterModal.hide();
    
    // Show notification
    showNotification('Filter Applied', `Found ${filteredTasks.length} tasks matching your filters`, 'info');
}

// Reset task filters
function resetTaskFilters() {
    // Reset checkboxes
    document.getElementById('filterPending').checked = true;
    document.getElementById('filterInProgress').checked = true;
    document.getElementById('filterCompleted').checked = true;
    document.getElementById('filterHigh').checked = true;
    document.getElementById('filterMedium').checked = true;
    document.getElementById('filterLow').checked = true;
    
    // Reset dropdowns
    document.getElementById('filterDepartment').value = '';
    document.getElementById('filterAssignee').value = '';
    
    // Reset date inputs
    document.getElementById('filterStartDate').value = '';
    document.getElementById('filterEndDate').value = '';
    
    // Reload all tasks
    loadTasksData();
    
    // Hide the filter modal
    const filterModal = bootstrap.Modal.getInstance(document.getElementById('filterTasksModal'));
    if (filterModal) filterModal.hide();
    
    // Show notification
    showNotification('Filters Reset', 'All filters have been reset', 'info');
}

// Show task statistics
function showTaskStatistics() {
    // Show the modal
    removeModalBackdrops();
    const statsModal = new bootstrap.Modal(document.getElementById('taskStatsModal'));
    statsModal.show();
    
    // Initialize charts
    initializeTaskStatusDistribution();
    initializeTaskPriorityDistribution();
    initializeTasksByDepartment();
    initializeTaskCompletionTimeline();
}

// Initialize task status distribution chart
function initializeTaskStatusDistribution() {
    const canvas = document.getElementById('taskStatusDistribution');
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

// Initialize task priority distribution chart
function initializeTaskPriorityDistribution() {
    const canvas = document.getElementById('taskPriorityDistribution');
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

// Initialize tasks by department chart
function initializeTasksByDepartment() {
    const canvas = document.getElementById('tasksByDepartment');
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
    
    // Generate colors
    const colors = generateDepartmentColors(departments.length);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: departments,
            datasets: [{
                label: 'Number of Tasks',
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

// Initialize task completion timeline chart
function initializeTaskCompletionTimeline() {
    const canvas = document.getElementById('taskCompletionTimeline');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Sort tasks by due date
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Get upcoming due dates (max 7)
    const upcomingTasks = sortedTasks.filter(task => task.status !== 'Completed').slice(0, 7);
    
    // If no upcoming tasks, show message
    if (upcomingTasks.length === 0) {
        // Display a message in the chart area
        canvas.chart = new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['No upcoming tasks'],
                datasets: [{
                    data: [0],
                    backgroundColor: 'rgba(108, 117, 125, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                },
                scales: {
                    y: {
                        display: false
                    }
                }
            }
        });
        return;
    }
    
    // Prepare data for chart
    const labels = upcomingTasks.map(task => task.title.length > 20 ? task.title.substring(0, 20) + '...' : task.title);
    const dueDates = upcomingTasks.map(task => {
        const dueDate = new Date(task.dueDate);
        return dueDate.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    });
    
    // Calculate days remaining for each task
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const daysRemaining = upcomingTasks.map(task => {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        const timeDiff = dueDate.getTime() - today.getTime();
        const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        return dayDiff;
    });
    
    // Generate colors based on days remaining
    const barColors = daysRemaining.map(days => {
        if (days < 0) return 'rgba(220, 53, 69, 0.8)'; // Overdue
        if (days < 3) return 'rgba(255, 193, 7, 0.8)'; // Due soon
        return 'rgba(40, 167, 69, 0.8)'; // Upcoming
    });
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Days Remaining',
                data: daysRemaining,
                backgroundColor: barColors,
                borderColor: barColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        title: function(tooltipItems) {
                            const index = tooltipItems[0].dataIndex;
                            return upcomingTasks[index].title;
                        },
                        label: function(context) {
                            const days = context.raw;
                            if (days < 0) {
                                return `Overdue by ${Math.abs(days)} days`;
                            } else if (days === 0) {
                                return 'Due today';
                            } else if (days === 1) {
                                return 'Due tomorrow';
                            } else {
                                return `Due in ${days} days`;
                            }
                        },
                        afterLabel: function(context) {
                            const index = context.dataIndex;
                            return `Due Date: ${dueDates[index]}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

// Generate department colors
function generateDepartmentColors(count) {
    const colors = [
        { bg: 'rgba(0, 123, 255, 0.7)', border: 'rgba(0, 123, 255, 1)' },    // Primary blue
        { bg: 'rgba(40, 167, 69, 0.7)', border: 'rgba(40, 167, 69, 1)' },    // Success green
        { bg: 'rgba(220, 53, 69, 0.7)', border: 'rgba(220, 53, 69, 1)' },    // Danger red
        { bg: 'rgba(255, 193, 7, 0.7)', border: 'rgba(255, 193, 7, 1)' },    // Warning yellow
        { bg: 'rgba(23, 162, 184, 0.7)', border: 'rgba(23, 162, 184, 1)' },  // Info cyan
        { bg: 'rgba(111, 66, 193, 0.7)', border: 'rgba(111, 66, 193, 1)' },  // Purple
        { bg: 'rgba(246, 130, 14, 0.7)', border: 'rgba(246, 130, 14, 1)' },  // Orange
        { bg: 'rgba(102, 16, 242, 0.7)', border: 'rgba(102, 16, 242, 1)' },  // Indigo
    ];
    
    // If we need more colors than in our base set, generate them
    const result = [...colors];
    
    while (result.length < count) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        
        result.push({
            bg: `rgba(${r}, ${g}, ${b}, 0.7)`,
            border: `rgba(${r}, ${g}, ${b}, 1)`
        });
    }
    
    return result.slice(0, count);
}

// Export tasks data as CSV
function exportTasksData() {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    if (tasks.length === 0) {
        showNotification('Export Failed', 'No task data to export', 'danger');
        return;
    }
    
    // Export to CSV
    exportToCSV(tasks, 'tasks_data.csv');
}

// Export task statistics
function exportTaskStats() {
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    if (tasks.length === 0) {
        showNotification('Export Failed', 'No task data to export', 'danger');
        return;
    }
    
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
    
    // Count tasks by department
    const departmentCounts = {};
    
    tasks.forEach(task => {
        if (!departmentCounts[task.department]) {
            departmentCounts[task.department] = 0;
        }
        departmentCounts[task.department]++;
    });
    
    // Create statistics data
    const statistics = [
        { Category: 'Status', Type: 'Completed', Count: statusCounts['Completed'] },
        { Category: 'Status', Type: 'In Progress', Count: statusCounts['In Progress'] },
        { Category: 'Status', Type: 'Pending', Count: statusCounts['Pending'] },
        { Category: 'Priority', Type: 'High', Count: priorityCounts['High'] },
        { Category: 'Priority', Type: 'Medium', Count: priorityCounts['Medium'] },
        { Category: 'Priority', Type: 'Low', Count: priorityCounts['Low'] }
    ];
    
    // Add department counts
    Object.entries(departmentCounts).forEach(([department, count]) => {
        statistics.push({ Category: 'Department', Type: department, Count: count });
    });
    
    // Export to CSV
    exportToCSV(statistics, 'task_statistics.csv');
}
