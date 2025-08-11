document.addEventListener('DOMContentLoaded', () => {
    const latestTaskContainer = document.getElementById('latest-task-container');
    const timelineContainer = document.getElementById('timeline');
    const addTaskForm = document.getElementById('add-task-form');
    const taskTitleInput = document.getElementById('task-title');
    const taskDescriptionInput = document.getElementById('task-description');
    const searchInput = document.getElementById('search-input');

    let allTasks = [];

    function createTaskElement(task, isLatest, animationClass) {
        const item = document.createElement('div');
        item.className = 'timeline-item';

        if (isLatest) {
            item.classList.add('latest-task');
        }

        if (animationClass) {
            item.classList.add(animationClass);
        }

        const title = document.createElement('h3');
        title.textContent = task.title;

        const description = document.createElement('p');
        description.textContent = task.description;

        const date = document.createElement('div');
        date.className = 'date';
        date.textContent = new Date(task.date).toDateString();

        item.appendChild(title);
        item.appendChild(description);
        item.appendChild(date);

        return item;
    }

    function renderTasks(tasks, newTaskId, isInitialLoad = false) {
        const tasksToRender = [...tasks];
        // Sort tasks by date in descending order only on initial load
        if (isInitialLoad) {
            tasksToRender.sort((a, b) => new Date(b.date) - new Date(a.date));
        }

        latestTaskContainer.innerHTML = '';
        timelineContainer.innerHTML = '';

        if (tasksToRender.length > 0) {
            const latestTask = tasksToRender[0];
            const latestTaskAnimation = newTaskId === latestTask.id ? 'new-item-animation' : (isInitialLoad ? 'initial-fade-in' : null);
            const latestTaskElement = createTaskElement(latestTask, true, latestTaskAnimation);
            latestTaskContainer.appendChild(latestTaskElement);

            const timelineTasks = tasksToRender.slice(1);
            timelineTasks.forEach(task => {
                const taskAnimation = newTaskId === task.id ? 'new-item-animation' : (isInitialLoad ? 'initial-fade-in' : null);
                const taskElement = createTaskElement(task, false, taskAnimation);
                timelineContainer.appendChild(taskElement);
            });
        } else {
            latestTaskContainer.innerHTML = '<p>No tasks found.</p>';
        }
    }

    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            allTasks = JSON.parse(storedTasks);
            renderTasks(allTasks, null, true);
        } else {
            fetch('data/tasks.json')
                .then(response => response.json())
                .then(tasks => {
                    tasks.forEach(t => t.id = t.date); // Add a temporary ID
                    allTasks = tasks;
                    localStorage.setItem('tasks', JSON.stringify(allTasks));
                    renderTasks(allTasks, null, true);
                })
                .catch(error => {
                    console.error('Error fetching tasks:', error);
                    latestTaskContainer.innerHTML = '<p>Could not load tasks. Please try again later.</p>';
                });
        }
    }

    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const newTaskId = new Date().toISOString();
        const newTask = {
            id: newTaskId,
            title: taskTitleInput.value,
            description: taskDescriptionInput.value,
            date: newTaskId
        };

        allTasks.unshift(newTask);
        localStorage.setItem('tasks', JSON.stringify(allTasks));
        renderTasks(allTasks, newTaskId);

        taskTitleInput.value = '';
        taskDescriptionInput.value = '';
        searchInput.value = '';
    });

    searchInput.addEventListener('input', () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredTasks = allTasks.filter(task => {
            return task.title.toLowerCase().includes(searchTerm) || task.description.toLowerCase().includes(searchTerm);
        });
        renderTasks(filteredTasks);
    });

    // Initial load
    loadTasks();
});
