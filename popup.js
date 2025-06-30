// Constants
const API_BASE_URL = 'http://localhost:5000'; // Development URL
// const API_BASE_URL = 'https://collab-ide-ep5q.onrender.com'; // Production URL

// DOM elements
const authStatusElement = document.getElementById('auth-status');
const loginFormElement = document.getElementById('login-form');
const userInfoElement = document.getElementById('user-info');
const userEmailElement = document.getElementById('user-email');
const enableToggleElement = document.getElementById('enable-toggle');
const loginButtonElement = document.getElementById('login-button');
const logoutButtonElement = document.getElementById('logout-button');
const viewSolutionsButtonElement = document.getElementById('view-solutions-button');
const lastSyncedElement = document.getElementById('last-synced');
const loginErrorElement = document.getElementById('login-error');
const emailInputElement = document.getElementById('email');
const passwordInputElement = document.getElementById('password');

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication status
  checkAuthStatus();
  
  // Check extension enabled status
  chrome.storage.local.get(['isEnabled', 'lastSynced'], (result) => {
    enableToggleElement.checked = result.isEnabled !== false; // Default to true
    
    if (result.lastSynced) {
      const lastSynced = new Date(result.lastSynced);
      lastSyncedElement.textContent = `Last synced: ${lastSynced.toLocaleDateString()} ${lastSynced.toLocaleTimeString()}`;
    } else {
      lastSyncedElement.textContent = 'No solutions synced yet';
    }
  });
  
  // Add event listeners
  loginButtonElement.addEventListener('click', handleLogin);
  logoutButtonElement.addEventListener('click', handleLogout);
  enableToggleElement.addEventListener('change', toggleExtension);
  viewSolutionsButtonElement.addEventListener('click', viewSolutions);
  
  // Add keyboard event listener for login form
  passwordInputElement.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      handleLogin();
    }
  });
});

// Check authentication status
function checkAuthStatus() {
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
    if (response.isAuthenticated) {
      // User is authenticated
      loginFormElement.style.display = 'none';
      userInfoElement.style.display = 'block';
      viewSolutionsButtonElement.disabled = false;
      
      // Display user info
      const username = response.user?.username || response.user?.email || 'User';
      userEmailElement.textContent = `Logged in as: ${username}`;
      authStatusElement.textContent = 'Authenticated';
      authStatusElement.style.color = '#38a169'; // Green color
    } else {
      // User is not authenticated
      loginFormElement.style.display = 'block';
      userInfoElement.style.display = 'none';
      viewSolutionsButtonElement.disabled = true;
      
      authStatusElement.textContent = 'Not authenticated';
      authStatusElement.style.color = '#e53e3e'; // Red color
    }
  });
}

// Handle login
async function handleLogin() {
  const email = emailInputElement.value.trim();
  const password = passwordInputElement.value;
  
  if (!email || !password) {
    loginErrorElement.textContent = 'Please enter both email and password';
    return;
  }
  
  loginButtonElement.disabled = true;
  loginButtonElement.textContent = 'Logging in...';
  loginErrorElement.textContent = '';
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok && data.token) {
      // Login successful
      chrome.runtime.sendMessage({
        type: 'LOGIN',
        token: data.token,
        user: data.user
      }, (response) => {
        if (response.success) {
          checkAuthStatus();
          loginButtonElement.textContent = 'Login';
          loginButtonElement.disabled = false;
          
          // Clear form
          emailInputElement.value = '';
          passwordInputElement.value = '';
        }
      });
    } else {
      // Login failed
      loginErrorElement.textContent = data.message || 'Login failed. Please check your credentials.';
      loginButtonElement.textContent = 'Login';
      loginButtonElement.disabled = false;
    }
  } catch (error) {
    loginErrorElement.textContent = 'Connection error. Please try again.';
    loginButtonElement.textContent = 'Login';
    loginButtonElement.disabled = false;
  }
}

// Handle logout
function handleLogout() {
  chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
    if (response.success) {
      checkAuthStatus();
    }
  });
}

// Toggle extension enabled/disabled
function toggleExtension() {
  const isEnabled = enableToggleElement.checked;
  
  chrome.runtime.sendMessage({ 
    type: 'TOGGLE_EXTENSION', 
  }, (response) => {
    if (response && response.isEnabled !== undefined) {
      enableToggleElement.checked = response.isEnabled;
    }
  });
}

// View solutions in Collab IDE
function viewSolutions() {
  chrome.tabs.create({ url: 'http://localhost:5173/leetcode' });
  // For production: chrome.tabs.create({ url: 'https://colab-ide.vercel.app/leetcode' });
}
