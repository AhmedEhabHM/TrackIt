// Utility functions
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Simple hash function for demo purposes (not secure for production)
function simpleHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(16);
}

// Auth functions
function register(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  if (users.find((u) => u.email === email)) {
    throw new Error("Email already exists");
  }
  const hashedPassword = simpleHash(password);
  const newUser = { id: generateUUID(), email, hashedPassword };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("user", JSON.stringify(newUser));
  return newUser;
}

function login(email, password) {
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const hashedPassword = simpleHash(password);
  const foundUser = users.find(
    (u) => u.email === email && u.hashedPassword === hashedPassword
  );
  if (!foundUser) {
    throw new Error("Invalid credentials");
  }
  localStorage.setItem("user", JSON.stringify(foundUser));
  return foundUser;
}

function logout() {
  localStorage.removeItem("user");
  showSection("home");
  updateNavbar();
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("user"));
}

// Show/hide sections
const sections = ["home", "login", "register", "dashboard"];
function showSection(section) {
  sections.forEach((s) => (document.getElementById(s).style.display = "none"));
  document.getElementById(section).style.display = "block";
  window.location.hash = section;
}

// Update navbar based on auth
function updateNavbar() {
  const user = getCurrentUser();
  document.getElementById("dashboardLink").style.display = user
    ? "block"
    : "none";
  document.getElementById("logoutLink").style.display = user ? "block" : "none";
}

// Dashboard functions
function loadDashboard() {
  const user = getCurrentUser();
  if (!user) {
    showSection("login");
    return;
  }
  document.getElementById("welcomeMessage").textContent = `Welcome back, ${
    user.email.split("@")[0]
  }!`;

  const todos = JSON.parse(localStorage.getItem(`todos_${user.id}`)) || [];
  const habits = JSON.parse(localStorage.getItem(`habits_${user.id}`)) || [];

  renderTodos(todos);
  renderHabits(habits);
  updateAnalytics(todos, habits);
}

function renderTodos(todos) {
  const todoList = document.getElementById("todoList");
  todoList.innerHTML = "";
  if (todos.length === 0) {
    document.getElementById("noTodos").style.display = "block";
  } else {
    document.getElementById("noTodos").style.display = "none";
    todos.forEach((todo) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <span style="${
                              todo.completed
                                ? "text-decoration: line-through; color: #6c757d;"
                                : ""
                            }">${todo.text}</span>
                            <div>
                                <button class="btn btn-sm btn-success me-2" onclick="toggleTodo('${
                                  todo.id
                                }')">${
        todo.completed ? "Undo" : "Done"
      }</button>
                                <button class="btn btn-sm btn-danger" onclick="deleteTodo('${
                                  todo.id
                                }')">Delete</button>
                            </div>
                        </div>
                    `;
      todoList.appendChild(card);
    });
  }
}

function renderHabits(habits) {
  const habitList = document.getElementById("habitList");
  habitList.innerHTML = "";
  if (habits.length === 0) {
    document.getElementById("noHabits").style.display = "block";
  } else {
    document.getElementById("noHabits").style.display = "none";
    habits.forEach((habit) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
                        <div class="card-body d-flex justify-content-between align-items-center">
                            <span>${habit.text} <small class="text-muted">- Streak: ${habit.streak} | Total: ${habit.count}</small></span>
                            <button class="btn btn-sm btn-primary" onclick="completeHabit('${habit.id}')">Mark Done</button>
                        </div>
                    `;
      habitList.appendChild(card);
    });
  }
}

function addTodo(text) {
  const user = getCurrentUser();
  const todos = JSON.parse(localStorage.getItem(`todos_${user.id}`)) || [];
  const newTodo = {
    id: generateUUID(),
    text,
    completed: false,
    created: new Date().toISOString(),
  };
  todos.push(newTodo);
  localStorage.setItem(`todos_${user.id}`, JSON.stringify(todos));
  renderTodos(todos);
  updateAnalytics(todos, null);
}

function toggleTodo(id) {
  const user = getCurrentUser();
  const todos = JSON.parse(localStorage.getItem(`todos_${user.id}`)) || [];
  const updatedTodos = todos.map((todo) =>
    todo.id === id ? { ...todo, completed: !todo.completed } : todo
  );
  localStorage.setItem(`todos_${user.id}`, JSON.stringify(updatedTodos));
  renderTodos(updatedTodos);
  updateAnalytics(updatedTodos, null);
}

function deleteTodo(id) {
  const user = getCurrentUser();
  const todos = JSON.parse(localStorage.getItem(`todos_${user.id}`)) || [];
  const updatedTodos = todos.filter((todo) => todo.id !== id);
  localStorage.setItem(`todos_${user.id}`, JSON.stringify(updatedTodos));
  renderTodos(updatedTodos);
  updateAnalytics(updatedTodos, null);
}

function addHabit(text) {
  const user = getCurrentUser();
  const habits = JSON.parse(localStorage.getItem(`habits_${user.id}`)) || [];
  const newHabit = {
    id: generateUUID(),
    text,
    count: 0,
    streak: 0,
    lastCompleted: null,
  };
  habits.push(newHabit);
  localStorage.setItem(`habits_${user.id}`, JSON.stringify(habits));
  renderHabits(habits);
  updateAnalytics(null, habits);
}

function completeHabit(id) {
  const user = getCurrentUser();
  const habits = JSON.parse(localStorage.getItem(`habits_${user.id}`)) || [];
  const today = new Date().toDateString();
  const updatedHabits = habits.map((habit) => {
    if (habit.id === id) {
      if (habit.lastCompleted === today) {
        return habit; // Already completed today, no change
      }
      const isNewDay = habit.lastCompleted !== today;
      return {
        ...habit,
        count: habit.count + 1,
        streak: isNewDay ? habit.streak + 1 : habit.streak,
        lastCompleted: today,
      };
    }
    return habit;
  });
  localStorage.setItem(`habits_${user.id}`, JSON.stringify(updatedHabits));
  renderHabits(updatedHabits);
  updateAnalytics(null, updatedHabits);
}

function updateAnalytics(todosParam, habitsParam) {
  const user = getCurrentUser();
  const todos =
    todosParam || JSON.parse(localStorage.getItem(`todos_${user.id}`)) || [];
  const habits =
    habitsParam || JSON.parse(localStorage.getItem(`habits_${user.id}`)) || [];
  const completedToday = todos.filter((todo) => todo.completed).length;
  const totalToday = todos.length;
  const completionRate = totalToday
    ? ((completedToday / totalToday) * 100).toFixed(0)
    : 0;
  const totalHabitsCompleted = habits.reduce(
    (sum, habit) => sum + habit.count,
    0
  );

  document.getElementById(
    "taskProgress"
  ).textContent = `Tasks Completed: ${completedToday}/${totalToday} (${completionRate}%)`;
  document.getElementById(
    "habitProgress"
  ).textContent = `Total Habit Completions: ${totalHabitsCompleted}`;
  const motivation = document.getElementById("motivation");
  if (completionRate >= 80) {
    motivation.textContent = "Great job! Keep the momentum going! 🚀";
    motivation.style.display = "block";
  } else if (completionRate >= 50) {
    motivation.textContent = "You're halfway there – push a bit more! 💪";
    motivation.style.display = "block";
  } else {
    motivation.style.display = "none";
  }
}

// Theme toggle
const themeToggle = document.getElementById("themeToggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  themeToggle.innerHTML = isDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

// Event listeners
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const error = document.getElementById("loginError");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.textContent = "Please enter a valid email";
    error.style.display = "block";
    return;
  }
  if (password.length < 6) {
    error.textContent = "Password must be at least 6 characters";
    error.style.display = "block";
    return;
  }
  try {
    login(email, password);
    showSection("dashboard");
    updateNavbar();
    loadDashboard();
    error.style.display = "none";
  } catch (err) {
    error.textContent = err.message;
    error.style.display = "block";
  }
});

document.getElementById("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value;
  const error = document.getElementById("registerError");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    error.textContent = "Please enter a valid email";
    error.style.display = "block";
    return;
  }
  if (password.length < 6) {
    error.textContent = "Password must be at least 6 characters";
    error.style.display = "block";
    return;
  }
  try {
    register(email, password);
    showSection("dashboard");
    updateNavbar();
    loadDashboard();
    error.style.display = "none";
  } catch (err) {
    error.textContent = err.message;
    error.style.display = "block";
  }
});

document.getElementById("addTodoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newTodo = document.getElementById("newTodo").value.trim();
  if (newTodo) {
    addTodo(newTodo);
    document.getElementById("newTodo").value = "";
  }
});

document.getElementById("addHabitForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const newHabit = document.getElementById("newHabit").value.trim();
  if (newHabit) {
    addHabit(newHabit);
    document.getElementById("newHabit").value = "";
  }
});

// Hash change listener for navigation
window.addEventListener("hashchange", () => {
  const hash = window.location.hash.slice(1) || "home";
  const user = getCurrentUser();
  if (hash === "dashboard" && !user) {
    showSection("login");
  } else if (hash === "home" && user) {
    showSection("dashboard"); // Redirect logged-in users from home to dashboard
  } else {
    showSection(hash);
  }
  if (hash === "dashboard") {
    loadDashboard();
  }
});

// Initial load
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  document.body.classList.add("dark-mode");
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}
updateNavbar();
const initialHash =
  window.location.hash.slice(1) || (getCurrentUser() ? "dashboard" : "home");
showSection(initialHash);
if (initialHash === "dashboard") {
  loadDashboard();
}
