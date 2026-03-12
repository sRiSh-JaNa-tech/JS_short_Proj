document.addEventListener('DOMContentLoaded', () => {
    const userId = document.getElementById('userId').value;
    const taskList = document.getElementById('taskList');
    const addTaskForm = document.getElementById('addTaskForm');
    const tasksLoading = document.getElementById('tasksLoading');
    const addLoading = document.getElementById('addLoading');
    const emptyState = document.getElementById('emptyState');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskTemplate = document.getElementById('taskTemplate');

    let allTasks = [];
    let currentFilter = 'all';

    // API Base URL
    const API_URL = `/tasks/${userId}`;

    // === Initialization ===
    fetchTasks();

    // === Event Listeners ===
    addTaskForm.addEventListener('submit', handleAddTask);

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderTasks();
        });
    });

    // === API Calls ===
    async function fetchTasks() {
        showLoading(true);
        try {
            const res = await fetch(`${API_URL}/get-all-Task`);
            if (!res.ok) throw new Error('Failed to fetch tasks');
            allTasks = await res.json();
            renderTasks();
        } catch (error) {
            console.error(error);
            showError('Could not load tasks. Please try again later.');
        } finally {
            showLoading(false);
        }
    }

    async function handleAddTask(e) {
        e.preventDefault();

        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDesc').value;
        const priority = document.getElementById('taskPriority').value;
        const dueDate = document.getElementById('taskDueDate').value;

        const payload = { title, description, priority, dueDate };

        addLoading.classList.remove('hidden');
        addTaskForm.querySelector('button[type="submit"]').disabled = true;

        try {
            const res = await fetch(`${API_URL}/create-task`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('Failed to create task');
            const newTask = await res.json();

            allTasks.unshift(newTask); // Add to beginning
            addTaskForm.reset();

            // Re-render tasks
            renderTasks();
        } catch (error) {
            console.error(error);
            alert('Error adding task. ' + error.message);
        } finally {
            addLoading.classList.add('hidden');
            addTaskForm.querySelector('button[type="submit"]').disabled = false;
        }
    }

    async function toggleTaskStatus(taskId, isCompleted) {
        try {
            // Using the /done/ route from the backend
            const res = await fetch(`${API_URL}/done/${taskId}`, {
                method: 'PUT'
            });

            if (!res.ok) throw new Error('Failed to update task');

            const updatedTask = await res.json();
            // Update local state
            const index = allTasks.findIndex(t => t._id === taskId);
            if (index !== -1) {
                allTasks[index].completed = updatedTask.completed;
                renderTasks();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
            // Re-fetch to guarantee sync with server
            fetchTasks();
        }
    }

    async function deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            const res = await fetch(`${API_URL}/delete/${taskId}`, {
                method: 'PUT'
            });

            if (!res.ok) throw new Error('Failed to delete task');

            // Remove from local state and update UI
            allTasks = allTasks.filter(t => t._id !== taskId);
            renderTasks();
        } catch (error) {
            console.error(error);
            alert('Failed to delete task');
        }
    }

    // === UI Rendering ===
    function renderTasks() {
        taskList.innerHTML = ''; // Clear current

        // Apply Filters
        let filteredTasks = allTasks;
        if (currentFilter === 'pending') {
            filteredTasks = allTasks.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = allTasks.filter(t => t.completed);
        }

        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');

            // Sort: pending first, then by priority, then by creation
            const sortedTasks = [...filteredTasks].sort((a, b) => {
                if (a.completed === b.completed) {
                    // Custom priority sorting: high -> medium -> low
                    const pValues = { high: 3, medium: 2, low: 1 };
                    const pA = pValues[a.priority] || 0;
                    const pB = pValues[b.priority] || 0;
                    if (pA !== pB) return pB - pA; // Descending
                    return new Date(b.createdAt) - new Date(a.createdAt); // newest first
                }
                return a.completed ? 1 : -1;
            });

            sortedTasks.forEach(task => {
                const node = taskTemplate.content.cloneNode(true);
                const li = node.querySelector('li');

                if (task.completed) li.classList.add('completed');

                node.querySelector('.task-title').textContent = task.title;

                // Description
                const descEl = node.querySelector('.task-desc');
                if (task.description) {
                    descEl.textContent = task.description;
                } else {
                    descEl.remove();
                }

                // Priority Badge
                const badge = node.querySelector('.priority-badge');
                if (task.priority) {
                    badge.textContent = task.priority;
                    badge.classList.add(`priority-${task.priority.toLowerCase()}`);
                } else {
                    badge.remove();
                }

                // Due Date
                const dateMeta = node.querySelector('.due-date');
                if (task.dueDate) {
                    const date = new Date(task.dueDate);
                    node.querySelector('.date-text').textContent = date.toLocaleDateString();

                    // Check if overdue
                    if (!task.completed && new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
                        dateMeta.classList.add('overdue');
                        dateMeta.title = 'Overdue';
                    }
                } else {
                    dateMeta.remove();
                }

                // Elements Interaction
                const checkbox = node.querySelector('.task-checkbox');
                checkbox.checked = task.completed;
                checkbox.addEventListener('change', (e) => toggleTaskStatus(task._id, e.target.checked));

                const delBtn = node.querySelector('.delete-btn');
                delBtn.addEventListener('click', () => deleteTask(task._id));

                taskList.appendChild(node);
            });
        }
    }

    function showLoading(show) {
        if (show) {
            tasksLoading.classList.remove('hidden');
            taskList.classList.add('hidden');
            emptyState.classList.add('hidden');
        } else {
            tasksLoading.classList.add('hidden');
            taskList.classList.remove('hidden');
        }
    }

    function showError(msg) {
        taskList.innerHTML = `<div class="empty-state"><p style="color:var(--priority-high)">${msg}</p></div>`;
    }
});
