/**
 * Employees JavaScript File
 * Gujarat Ministry of Defence - HOD Department
 * 
 * This file contains functionality for employee management
 */

// Initialize employees page when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Employees page initialized');
    
    // Load employees data
    loadEmployeesData();
    
    // Initialize charts
    initializeDepartmentChart();
    initializeStatusChart();
    
    // Setup event listeners
    setupEmployeesEventListeners();
});

// Setup event listeners for employees page
function setupEmployeesEventListeners() {
    // Add employee form submit
    const saveEmployeeBtn = document.getElementById('saveEmployeeBtn');
    if (saveEmployeeBtn) {
        saveEmployeeBtn.addEventListener('click', addEmployee);
    }
    
    // Update employee form submit
    const updateEmployeeBtn = document.getElementById('updateEmployeeBtn');
    if (updateEmployeeBtn) {
        updateEmployeeBtn.addEventListener('click', updateEmployee);
    }
    
    // Delete employee button
    const deleteEmployeeBtn = document.getElementById('deleteEmployeeBtn');
    if (deleteEmployeeBtn) {
        deleteEmployeeBtn.addEventListener('click', function() {
            const employeeIndex = document.getElementById('editEmployeeIndex').value;
            showDeleteConfirmation(employeeIndex);
        });
    }
    
    // Confirm delete button
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener('click', deleteEmployee);
    }
    
    // Search employees
    const employeeSearchBtn = document.getElementById('employeeSearchBtn');
    if (employeeSearchBtn) {
        employeeSearchBtn.addEventListener('click', searchEmployees);
    }
    
    // Search on enter key
    const employeeSearch = document.getElementById('employeeSearch');
    if (employeeSearch) {
        employeeSearch.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchEmployees();
            }
        });
    }
    
    // Export employees
    const exportEmployeesBtn = document.getElementById('exportEmployees');
    if (exportEmployeesBtn) {
        exportEmployeesBtn.addEventListener('click', exportEmployeesData);
    }
    
    // Print employees
    const printEmployeesBtn = document.getElementById('printEmployees');
    if (printEmployeesBtn) {
        printEmployeesBtn.addEventListener('click', function() {
            printContent('employeesTable');
        });
    }
}

// Load employees data and populate the table
function loadEmployeesData() {
    const employeeListElement = document.getElementById('employeesList');
    const employeeCountElement = document.getElementById('employeeCount');
    
    if (!employeeListElement) return;
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Update employee count
    if (employeeCountElement) {
        employeeCountElement.textContent = employees.length;
    }
    
    // If no employees, show message
    if (employees.length === 0) {
        employeeListElement.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-users fa-3x mb-3"></i>
                        <p>No employees found</p>
                        <button class="btn btn-primary mt-2" data-bs-toggle="modal" data-bs-target="#addEmployeeModal">
                            <i class="fas fa-user-plus"></i> Add Employee
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Generate HTML for employees table
    let html = '';
    
    employees.forEach((employee, index) => {
        // Determine status class
        let statusClass = '';
        switch (employee.status) {
            case 'Active':
                statusClass = 'success';
                break;
            case 'On Leave':
                statusClass = 'warning';
                break;
            case 'Suspended':
                statusClass = 'danger';
                break;
            case 'Transferred':
                statusClass = 'info';
                break;
            case 'Retired':
                statusClass = 'secondary';
                break;
            default:
                statusClass = 'secondary';
        }
        
        html += `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.position}</td>
                <td>${employee.department}</td>
                <td>
                    <a href="mailto:${employee.email}" class="text-decoration-none">${employee.email}</a>
                    <br>
                    <small>${employee.phone}</small>
                </td>
                <td><span class="badge bg-${statusClass}">${employee.status}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-employee-btn" data-employee-index="${index}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning edit-employee-btn" data-employee-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-employee-btn" data-employee-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    employeeListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addEmployeeButtonEventListeners();
}

// Add event listeners to employee action buttons
function addEmployeeButtonEventListeners() {
    // View employee buttons
    const viewButtons = document.querySelectorAll('.view-employee-btn');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const employeeIndex = this.getAttribute('data-employee-index');
            viewEmployee(employeeIndex);
        });
    });
    
    // Edit employee buttons
    const editButtons = document.querySelectorAll('.edit-employee-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const employeeIndex = this.getAttribute('data-employee-index');
            editEmployee(employeeIndex);
        });
    });
    
    // Delete employee buttons
    const deleteButtons = document.querySelectorAll('.delete-employee-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const employeeIndex = this.getAttribute('data-employee-index');
            showDeleteConfirmation(employeeIndex);
        });
    });
}

// View employee details
function viewEmployee(index) {
    // Check if index is valid
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    if (index < 0 || index >= employees.length) {
        showNotification('Error', 'Employee not found', 'danger');
        return;
    }
    
    const employee = employees[index];
    
    // Populate the view modal
    document.getElementById('viewEmployeeName').textContent = employee.name;
    document.getElementById('viewEmployeePosition').textContent = employee.position;
    document.getElementById('viewEmployeeId').textContent = employee.id;
    document.getElementById('viewEmployeeDepartment').textContent = employee.department;
    document.getElementById('viewEmployeeJoinDate').textContent = formatDate(employee.joinDate);
    document.getElementById('viewEmployeeEmail').textContent = employee.email;
    document.getElementById('viewEmployeePhone').textContent = employee.phone;
    document.getElementById('viewEmployeeStatus').textContent = employee.status;
    document.getElementById('viewEmployeeAddress').textContent = employee.address || 'Not specified';
    
    // Load employee tasks
    loadEmployeeTasks(employee.name);
    
    // Set up edit button
    const editBtn = document.getElementById('employeeEditBtn');
    if (editBtn) {
        editBtn.addEventListener('click', function() {
            // Hide view modal
            const viewModal = bootstrap.Modal.getInstance(document.getElementById('viewEmployeeModal'));
            viewModal.hide();
            
            // Show edit modal
            editEmployee(index);
        });
    }
    
    // Show the modal
    const viewModal = new bootstrap.Modal(document.getElementById('viewEmployeeModal'));
    viewModal.show();
}

// Load tasks assigned to an employee
function loadEmployeeTasks(employeeName) {
    const tasksElement = document.getElementById('viewEmployeeTasks');
    if (!tasksElement) return;
    
    // Get tasks from localStorage
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Filter tasks for this employee
    const employeeTasks = tasks.filter(task => task.assignedTo === employeeName);
    
    // If no tasks, show message
    if (employeeTasks.length === 0) {
        tasksElement.innerHTML = `
            <li class="list-group-item text-center text-muted">No tasks assigned</li>
        `;
        return;
    }
    
    // Generate HTML for tasks
    let html = '';
    
    employeeTasks.forEach(task => {
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
        
        html += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>${task.title}</strong>
                    <div class="small text-muted">Due: ${formatDate(task.dueDate)}</div>
                </div>
                <span class="badge bg-${statusClass}">${task.status}</span>
            </li>
        `;
    });
    
    tasksElement.innerHTML = html;
}

// Edit employee
function editEmployee(index) {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', `edit:employee:${index}`);
        return;
    }
    
    // Check if index is valid
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    if (index < 0 || index >= employees.length) {
        showNotification('Error', 'Employee not found', 'danger');
        return;
    }
    
    const employee = employees[index];
    
    // Populate the edit form
    document.getElementById('editEmployeeIndex').value = index;
    document.getElementById('editEmployeeId').value = employee.id;
    document.getElementById('editEmployeeName').value = employee.name;
    document.getElementById('editEmployeePosition').value = employee.position;
    document.getElementById('editEmployeeDepartment').value = employee.department;
    document.getElementById('editEmployeeEmail').value = employee.email;
    document.getElementById('editEmployeePhone').value = employee.phone;
    document.getElementById('editEmployeeJoinDate').value = employee.joinDate;
    document.getElementById('editEmployeeStatus').value = employee.status;
    document.getElementById('editEmployeeAddress').value = employee.address || '';
    
    // Show the modal
    const editModal = new bootstrap.Modal(document.getElementById('editEmployeeModal'));
    editModal.show();
}

// Show delete confirmation
function showDeleteConfirmation(index) {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', `delete:employee:${index}`);
        return;
    }
    
    // Check if index is valid
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    if (index < 0 || index >= employees.length) {
        showNotification('Error', 'Employee not found', 'danger');
        return;
    }
    
    const employee = employees[index];
    
    // Set employee index (hidden)
    document.getElementById('editEmployeeIndex').value = index;
    
    // Set employee name in confirmation modal
    document.getElementById('deleteEmployeeName').textContent = employee.name;
    
    // Clean up any modal backdrops and show the modal
    removeModalBackdrops();
    const confirmModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
    confirmModal.show();
}

// Add new employee
function addEmployee() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        localStorage.setItem('pendingAdminAction', 'addEmployee');
        return;
    }
    
    // Get form values
    const id = document.getElementById('employeeId').value;
    const name = document.getElementById('employeeName').value;
    const position = document.getElementById('employeePosition').value;
    const department = document.getElementById('employeeDepartment').value;
    const email = document.getElementById('employeeEmail').value;
    const phone = document.getElementById('employeePhone').value;
    const joinDate = document.getElementById('employeeJoinDate').value;
    const status = document.getElementById('employeeStatus').value;
    const address = document.getElementById('employeeAddress').value;
    
    // Basic validation
    if (!id || !name || !position || !department || !email || !phone || !joinDate || !status) {
        showNotification('Error', 'Please fill in all required fields', 'danger');
        return;
    }
    
    // Create employee object
    const newEmployee = {
        id,
        name,
        position,
        department,
        email,
        phone,
        joinDate,
        status,
        address
    };
    
    // Get existing employees
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Check if ID already exists
    if (employees.some(emp => emp.id === id)) {
        showNotification('Error', 'Employee ID already exists', 'danger');
        return;
    }
    
    // Add to employees array
    employees.push(newEmployee);
    
    // Save to localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('totalEmployees', employees.length.toString());
    
    // Log the activity
    logActivity('Added employee', 'Administrator', `Added employee ${name} (${id})`);
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addEmployeeModal'));
    modal.hide();
    
    // Reset the form
    document.getElementById('addEmployeeForm').reset();
    
    // Reload employees data
    loadEmployeesData();
    
    // Refresh charts
    initializeDepartmentChart();
    initializeStatusChart();
    
    // Show success message
    showNotification('Success', 'Employee added successfully', 'success');
}

// Update employee
function updateEmployee() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        const index = document.getElementById('editEmployeeIndex').value;
        localStorage.setItem('pendingAdminAction', `edit:employee:${index}`);
        return;
    }
    
    // Get form values
    const index = document.getElementById('editEmployeeIndex').value;
    const id = document.getElementById('editEmployeeId').value;
    const name = document.getElementById('editEmployeeName').value;
    const position = document.getElementById('editEmployeePosition').value;
    const department = document.getElementById('editEmployeeDepartment').value;
    const email = document.getElementById('editEmployeeEmail').value;
    const phone = document.getElementById('editEmployeePhone').value;
    const joinDate = document.getElementById('editEmployeeJoinDate').value;
    const status = document.getElementById('editEmployeeStatus').value;
    const address = document.getElementById('editEmployeeAddress').value;
    
    // Basic validation
    if (!id || !name || !position || !department || !email || !phone || !joinDate || !status) {
        showNotification('Error', 'Please fill in all required fields', 'danger');
        return;
    }
    
    // Get existing employees
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Check if index is valid
    if (index < 0 || index >= employees.length) {
        showNotification('Error', 'Employee not found', 'danger');
        return;
    }
    
    // Check if ID already exists (excluding the current employee)
    if (employees.some((emp, i) => emp.id === id && i != index)) {
        showNotification('Error', 'Employee ID already exists', 'danger');
        return;
    }
    
    // Get old name for task updates
    const oldName = employees[index].name;
    
    // Update employee
    employees[index] = {
        id,
        name,
        position,
        department,
        email,
        phone,
        joinDate,
        status,
        address
    };
    
    // Save to localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    
    // Update any tasks assigned to this employee (if name changed)
    if (oldName !== name) {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        
        tasks.forEach((task, taskIndex) => {
            if (task.assignedTo === oldName) {
                tasks[taskIndex].assignedTo = name;
            }
        });
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Log the activity
    logActivity('Updated employee', 'Administrator', `Updated employee ${name} (${id})`);
    
    // Hide the modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
    modal.hide();
    
    // Reload employees data
    loadEmployeesData();
    
    // Refresh charts
    initializeDepartmentChart();
    initializeStatusChart();
    
    // Show success message
    showNotification('Success', 'Employee updated successfully', 'success');
}

// Delete employee
function deleteEmployee() {
    // Check if user is logged in
    if (!requireLogin()) {
        // Store the intended action for after login
        const index = document.getElementById('editEmployeeIndex').value;
        localStorage.setItem('pendingAdminAction', `delete:employee:${index}`);
        return;
    }
    
    // Get employee index
    const index = document.getElementById('editEmployeeIndex').value;
    
    // Get existing employees
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Check if index is valid
    if (index < 0 || index >= employees.length) {
        showNotification('Error', 'Employee not found', 'danger');
        return;
    }
    
    // Store employee details for logging
    const employee = employees[index];
    
    // Remove the employee
    employees.splice(index, 1);
    
    // Save to localStorage
    localStorage.setItem('employees', JSON.stringify(employees));
    localStorage.setItem('totalEmployees', employees.length.toString());
    
    // Handle tasks assigned to this employee
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let tasksUpdated = false;
    
    tasks.forEach((task, taskIndex) => {
        if (task.assignedTo === employee.name) {
            // Set task to unassigned
            tasks[taskIndex].assignedTo = 'Unassigned';
            tasksUpdated = true;
        }
    });
    
    if (tasksUpdated) {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Log the activity
    logActivity('Deleted employee', 'Administrator', `Deleted employee ${employee.name} (${employee.id})`);
    
    // Hide the modals
    const editModal = bootstrap.Modal.getInstance(document.getElementById('editEmployeeModal'));
    if (editModal) editModal.hide();
    
    const confirmModal = bootstrap.Modal.getInstance(document.getElementById('deleteConfirmModal'));
    if (confirmModal) confirmModal.hide();
    
    // Reload employees data
    loadEmployeesData();
    
    // Refresh charts
    initializeDepartmentChart();
    initializeStatusChart();
    
    // Show success message
    showNotification('Success', 'Employee deleted successfully', 'success');
}

// Search employees
function searchEmployees() {
    const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
    
    // If search term is empty, load all employees
    if (!searchTerm.trim()) {
        loadEmployeesData();
        return;
    }
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Filter employees by search term
    const filteredEmployees = employees.filter(employee => {
        return (
            employee.id.toLowerCase().includes(searchTerm) ||
            employee.name.toLowerCase().includes(searchTerm) ||
            employee.position.toLowerCase().includes(searchTerm) ||
            employee.department.toLowerCase().includes(searchTerm) ||
            employee.email.toLowerCase().includes(searchTerm) ||
            employee.phone.toLowerCase().includes(searchTerm)
        );
    });
    
    // Update employee count
    const employeeCountElement = document.getElementById('employeeCount');
    if (employeeCountElement) {
        employeeCountElement.textContent = filteredEmployees.length;
    }
    
    // Get the table body element
    const employeeListElement = document.getElementById('employeesList');
    if (!employeeListElement) return;
    
    // If no matching employees, show message
    if (filteredEmployees.length === 0) {
        employeeListElement.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-search fa-3x mb-3"></i>
                        <p>No employees found matching "${searchTerm}"</p>
                        <button class="btn btn-outline-secondary mt-2" onclick="loadEmployeesData()">
                            <i class="fas fa-sync-alt"></i> Show All Employees
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    // Generate HTML for filtered employees
    let html = '';
    
    filteredEmployees.forEach((employee, filteredIndex) => {
        // Find the original index in the full array
        const originalIndex = employees.findIndex(emp => emp.id === employee.id);
        
        // Determine status class
        let statusClass = '';
        switch (employee.status) {
            case 'Active':
                statusClass = 'success';
                break;
            case 'On Leave':
                statusClass = 'warning';
                break;
            case 'Suspended':
                statusClass = 'danger';
                break;
            case 'Transferred':
                statusClass = 'info';
                break;
            case 'Retired':
                statusClass = 'secondary';
                break;
            default:
                statusClass = 'secondary';
        }
        
        html += `
            <tr>
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.position}</td>
                <td>${employee.department}</td>
                <td>
                    <a href="mailto:${employee.email}" class="text-decoration-none">${employee.email}</a>
                    <br>
                    <small>${employee.phone}</small>
                </td>
                <td><span class="badge bg-${statusClass}">${employee.status}</span></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary view-employee-btn" data-employee-index="${originalIndex}">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning edit-employee-btn" data-employee-index="${originalIndex}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-employee-btn" data-employee-index="${originalIndex}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    employeeListElement.innerHTML = html;
    
    // Add event listeners to the buttons
    addEmployeeButtonEventListeners();
    
    // Show notification
    showNotification('Search Results', `Found ${filteredEmployees.length} employees matching "${searchTerm}"`, 'info');
}

// Initialize department distribution chart
function initializeDepartmentChart() {
    const canvas = document.getElementById('departmentChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Count employees by department
    const departmentCounts = {};
    
    employees.forEach(employee => {
        if (!departmentCounts[employee.department]) {
            departmentCounts[employee.department] = 0;
        }
        departmentCounts[employee.department]++;
    });
    
    // Create chart data
    const departments = Object.keys(departmentCounts);
    const counts = Object.values(departmentCounts);
    
    // Generate colors
    const colors = generateDepartmentColors(departments.length);
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'doughnut',
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
                    position: 'bottom',
                    labels: {
                        boxWidth: 12
                    }
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

// Initialize employee status chart
function initializeStatusChart() {
    const canvas = document.getElementById('statusChart');
    if (!canvas) return;
    
    // Clear existing chart if any
    if (canvas.chart) {
        canvas.chart.destroy();
    }
    
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    // Count employees by status
    const statusCounts = {
        'Active': 0,
        'On Leave': 0,
        'Transferred': 0,
        'Suspended': 0,
        'Retired': 0
    };
    
    employees.forEach(employee => {
        if (statusCounts.hasOwnProperty(employee.status)) {
            statusCounts[employee.status]++;
        } else {
            statusCounts[employee.status] = 1;
        }
    });
    
    // Create chart
    const ctx = canvas.getContext('2d');
    canvas.chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(statusCounts),
            datasets: [{
                label: 'Employees',
                data: Object.values(statusCounts),
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',   // Active - Green
                    'rgba(255, 193, 7, 0.8)',   // On Leave - Yellow
                    'rgba(23, 162, 184, 0.8)',  // Transferred - Cyan
                    'rgba(220, 53, 69, 0.8)',   // Suspended - Red
                    'rgba(108, 117, 125, 0.8)'  // Retired - Gray
                ],
                borderColor: [
                    'rgba(40, 167, 69, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(23, 162, 184, 1)',
                    'rgba(220, 53, 69, 1)',
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

// Generate colors for department chart
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

// Export employees data as CSV
function exportEmployeesData() {
    // Get employees from localStorage
    const employees = JSON.parse(localStorage.getItem('employees')) || [];
    
    if (employees.length === 0) {
        showNotification('Export Failed', 'No employee data to export', 'danger');
        return;
    }
    
    // Export to CSV
    exportToCSV(employees, 'employees_data.csv');
}
