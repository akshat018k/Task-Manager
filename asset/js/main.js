const taskForm = document.getElementById("task-form");
const taskTitle = document.getElementById("task-title");
const taskDescription =
  document.getElementById("task-description");
const dueDate = document.getElementById("due-date");
const priority = document.getElementById("priority");
const tasksContainer =
  document.querySelector(".tasks-container");
const searchTask =
  document.getElementById("search-task");
const totalTasks =
  document.querySelector(".total-tasks strong");
const filterButtons =
  document.querySelectorAll(".filter-btn");

let tasks = [];
let currentFilter = "all";
let editTaskId = null;

function loadTasks() {
  const savedTasks = localStorage.getItem("tasks");
  if (savedTasks) {
    tasks = JSON.parse(savedTasks);
  }
}


function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function addTask(event) {
  event.preventDefault();
  const title = taskTitle.value.trim();
  const description =
    taskDescription.value.trim();
  const date = dueDate.value;
  const taskPriority = priority.value;
  if (title === "") {
    alert("Please enter task title.");
    taskTitle.focus();
    return;
  }
  if (date === "") {
    alert("Please select due date.");
    dueDate.focus();
    return;
  }
  const newTask = {
    id: Date.now(),
    title: title,
    description: description,
    dueDate: date,
    priority: taskPriority
  };
  tasks.push(newTask);
  saveTasks();
  displayTasks();
  taskForm.reset();
  priority.value = "medium";
}

function displayTasks() {
  tasksContainer.innerHTML = "";
  const searchValue =
    searchTask.value.trim().toLowerCase();
  const filteredTasks = tasks.filter((task) => {
    const matchesPriority =
      currentFilter === "all" ||
      task.priority === currentFilter;
    const matchesSearch =
      task.title.toLowerCase().includes(searchValue) ||
      task.description.toLowerCase().includes(searchValue);
    return matchesPriority && matchesSearch;
  });
  if (filteredTasks.length === 0) {
    tasksContainer.innerHTML = `
      <div class="no-tasks">
        <h3>No Tasks Found</h3>
        <p>Add a new task or change your search/filter.</p>
      </div>
    `;
    updateTotalTasks();
    return;
  }
  filteredTasks.forEach((task) => {
    const taskCard =
      document.createElement("div");
    taskCard.className =
      `task-card ${task.priority}-task`;
    taskCard.innerHTML = `
      <div class="task-content">
        <h3>${escapeHTML(task.title)}</h3>
        <p>
          ${escapeHTML(
            task.description || "No description provided."
          )}
        </p>
        <div class="task-date">
          📅 ${formatDate(task.dueDate)}
        </div>
      </div>
      <div class="task-priority ${task.priority}">
        ● ${capitalize(task.priority)}
      </div>
      <div class="task-actions">
        <button
          class="edit-btn"
          onclick="editTask(${task.id})"
        >
          ✎ Edit
        </button>
        <button
          class="delete-btn"
          onclick="deleteTask(${task.id})"
        >
          🗑 Delete
        </button>
      </div>
    `;
    tasksContainer.appendChild(taskCard);
  });
  updateTotalTasks();
}

function editTask(id) {
  const task =
    tasks.find((task) => task.id === id);
  if (!task) {
    return;
  }
  taskTitle.value = task.title;
  taskDescription.value = task.description;
  dueDate.value = task.dueDate;
  priority.value = task.priority;
  editTaskId = id;
  const button =
    taskForm.querySelector(".form-btn button");
  button.innerHTML =
    `<span>✓</span> Update Task`;
  document.querySelector(".add-new").scrollIntoView({
    behavior: "smooth"
  });
  taskTitle.focus();
}

function updateTask() {
  const title =
    taskTitle.value.trim();
  const description =
    taskDescription.value.trim();
  const date =
    dueDate.value;
  const taskPriority =
    priority.value;
  if (title === "") {
    alert("Please enter task title.");
    taskTitle.focus();
    return;
  }
  if (date === "") {
    alert("Please select due date.");
    dueDate.focus();
    return;
  }

  const taskIndex =
    tasks.findIndex(
      (task) => task.id === editTaskId
    );
  if (taskIndex === -1) {
    return;
  }
  tasks[taskIndex] = {
    id: editTaskId,
    title: title,
    description: description,
    dueDate: date,
    priority: taskPriority
  };
  saveTasks();
  displayTasks();
  taskForm.reset();
  priority.value = "medium";
  editTaskId = null;
  const button =
    taskForm.querySelector(".form-btn button");
  button.innerHTML =
    `<span>+</span> Add Task`;
}

function deleteTask(id) {
  const task =
    tasks.find((task) => task.id === id);
  if (!task) {
    return;
  }
  const confirmDelete =
    confirm(
      `Are you sure you want to delete "${task.title}"?`
    );
  if (!confirmDelete) {
    return;
  }
  tasks =
    tasks.filter(
      (task) => task.id !== id
    );
  saveTasks();
  displayTasks();
}

searchTask.addEventListener("input", () => {
  displayTasks();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.remove("active");
    });
    button.classList.add("active");
    if (button.classList.contains("low-filter")) {
      currentFilter = "low";
    }
    else if (
      button.classList.contains("medium-filter")
    ) {
      currentFilter = "medium";
    }
    else if (
      button.classList.contains("high-filter")
    ) {
      currentFilter = "high";
    }
    else {
      currentFilter = "all";
    }
    displayTasks();
  });
});

taskForm.addEventListener("submit", (event) => {
  if (editTaskId !== null) {
    updateTask();
  }
  else {
    addTask(event);
  }
});

function updateTotalTasks() {
  totalTasks.textContent = tasks.length;
}

function formatDate(dateString) {
  const date =
    new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() +
    text.slice(1);
}

function escapeHTML(text) {
  const div =
    document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

loadTasks();
displayTasks();