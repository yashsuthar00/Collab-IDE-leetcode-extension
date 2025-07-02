// DOM elements and state
let problemData = null;
let floatingButton = null;
let actionPanel = null;
let isEnabled = true;
let isInitialized = false;

// Initialize the extension UI on the LeetCode page
function initializeUI() {
  if (isInitialized) return;
  
  // Check if extension is enabled
  chrome.storage.local.get(['isEnabled'], (result) => {
    isEnabled = result.isEnabled !== false; // Default to true if not set
    
    if (isEnabled) {
      createFloatingButton();
      extractProblemData();
    }
    
    isInitialized = true;
  });
}

// Extract problem data from the LeetCode page
function extractProblemData() {
  // Extract problem title from the page
  const titleElement = document.querySelector('title');
  let problemTitle = titleElement ? titleElement.textContent.split('-')[0].trim() : '';
  
  // Fallback to H4 element if title is not accurate
  const h4Elements = document.querySelectorAll('h4');
  for (const h4 of h4Elements) {
    if (h4.textContent.length > 3 && !h4.textContent.includes('Example')) {
      problemTitle = h4.textContent.trim();
      break;
    }
  }
  
  // Extract problem description
  const descriptionElements = document.querySelectorAll('[data-track-load="description_content"]');
  let problemDescription = '';
  if (descriptionElements.length > 0) {
    problemDescription = descriptionElements[0].textContent.trim();
  } else {
    // Alternative selector for description
    const descDivs = document.querySelectorAll('div.content__u3I1 > div[data-cy="question-description"]');
    if (descDivs.length > 0) {
      problemDescription = descDivs[0].textContent.trim();
    }
  }
  
  // Extract problem difficulty
  const difficultyElement = document.querySelector('.difficulty-label');
  let difficulty = difficultyElement ? difficultyElement.textContent.trim() : '';
  
  // Extract problem URL
  const leetcodeUrl = window.location.href;
  
  // Store problem data
  problemData = {
    problemTitle,
    problemDescription,
    difficulty,
    leetcodeUrl
  };
  
  console.log('Extracted problem data:', problemData);
}

// Create a floating button in the bottom right corner
function createFloatingButton() {
  // Create button element
  floatingButton = document.createElement('div');
  floatingButton.id = 'collab-ide-button';
  floatingButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 16V9h14V2H5L19 16H5z" />
      <path d="M5 22h14v-6H5v6z" />
    </svg>
  `;
  
  // Style the button
  floatingButton.style.position = 'fixed';
  floatingButton.style.bottom = '20px';
  floatingButton.style.right = '20px';
  floatingButton.style.width = '48px';
  floatingButton.style.height = '48px';
  floatingButton.style.borderRadius = '50%';
  floatingButton.style.backgroundColor = '#4299e1'; // Blue color
  floatingButton.style.color = 'white';
  floatingButton.style.display = 'flex';
  floatingButton.style.alignItems = 'center';
  floatingButton.style.justifyContent = 'center';
  floatingButton.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
  floatingButton.style.cursor = 'pointer';
  floatingButton.style.zIndex = '9999';
  floatingButton.style.transition = 'transform 0.2s, background-color 0.2s';
  
  // Add hover effect
  floatingButton.addEventListener('mouseover', () => {
    floatingButton.style.transform = 'scale(1.1)';
    floatingButton.style.backgroundColor = '#3182ce'; // Darker blue
  });
  
  floatingButton.addEventListener('mouseout', () => {
    floatingButton.style.transform = 'scale(1)';
    floatingButton.style.backgroundColor = '#4299e1';
  });
  
  // Add click event to show the action panel
  floatingButton.addEventListener('click', () => {
    if (actionPanel) {
      actionPanel.remove();
      actionPanel = null;
      return;
    }
    
    showActionPanel();
  });
  
  // Add to the page
  document.body.appendChild(floatingButton);
}

// Show action panel with buttons to save or view solutions
function showActionPanel() {
  // Create panel element
  actionPanel = document.createElement('div');
  actionPanel.id = 'collab-ide-panel';
  
  // Style the panel
  actionPanel.style.position = 'fixed';
  actionPanel.style.bottom = '80px';
  actionPanel.style.right = '20px';
  actionPanel.style.width = '300px';
  actionPanel.style.backgroundColor = 'white';
  actionPanel.style.borderRadius = '8px';
  actionPanel.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  actionPanel.style.padding = '16px';
  actionPanel.style.zIndex = '9999';
  actionPanel.style.fontFamily = 'Arial, sans-serif';
  
  // Create panel content
  actionPanel.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 16px; color: #333;">Collab IDE</h3>
      <button id="collab-ide-close-panel" style="background: none; border: none; cursor: pointer; font-size: 18px; color: #666;">&times;</button>
    </div>
    <div id="collab-ide-auth-status" style="margin-bottom: 16px; font-size: 14px; color: #666;">
      Checking authentication...
    </div>
    <div id="collab-ide-actions">
      <button id="collab-ide-save" style="width: 100%; padding: 8px; margin-bottom: 8px; background-color: #4299e1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
        Save Current Solution
      </button>
      <button id="collab-ide-view" style="width: 100%; padding: 8px; margin-bottom: 8px; background-color: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 14px;">
        View My Solutions
      </button>
      <button id="collab-ide-login" style="width: 100%; padding: 8px; background-color: #38a169; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; display: none;">
        Login to Collab IDE
      </button>
      <button id="collab-ide-logout" style="width: 100%; padding: 8px; background-color: #e53e3e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; display: none;">
        Logout
      </button>
    </div>
    <div id="collab-ide-status" style="margin-top: 12px; font-size: 12px; color: #666;"></div>
  `;
  
  // Add to the page
  document.body.appendChild(actionPanel);
  
  // Add event listeners
  document.getElementById('collab-ide-close-panel').addEventListener('click', () => {
    actionPanel.remove();
    actionPanel = null;
  });
  
  document.getElementById('collab-ide-save').addEventListener('click', saveSolution);
  document.getElementById('collab-ide-view').addEventListener('click', viewSolutions);
  document.getElementById('collab-ide-login').addEventListener('click', openLoginPopup);
  document.getElementById('collab-ide-logout').addEventListener('click', logout);
  
  // Check authentication
  checkAuthentication();
}

// Check if the user is authenticated
function checkAuthentication() {
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
    const authStatusElement = document.getElementById('collab-ide-auth-status');
    const loginButton = document.getElementById('collab-ide-login');
    const logoutButton = document.getElementById('collab-ide-logout');
    const saveButton = document.getElementById('collab-ide-save');
    const viewButton = document.getElementById('collab-ide-view');
    
    if (response.isAuthenticated) {
      const username = response.user?.username || response.user?.email || 'User';
      authStatusElement.textContent = `Logged in as ${username}`;
      loginButton.style.display = 'none';
      logoutButton.style.display = 'block';
      saveButton.disabled = false;
      viewButton.disabled = false;
    } else {
      authStatusElement.textContent = 'Not logged in';
      loginButton.style.display = 'block';
      logoutButton.style.display = 'none';
      saveButton.disabled = true;
      viewButton.disabled = true;
      
      // Add styling for disabled buttons
      saveButton.style.opacity = '0.6';
      saveButton.style.cursor = 'not-allowed';
      viewButton.style.opacity = '0.6';
      viewButton.style.cursor = 'not-allowed';
    }
  });
}

// Save the current solution
function saveSolution() {
  // Update status
  const statusElement = document.getElementById('collab-ide-status');
  statusElement.textContent = 'Getting solution...';
  
  // Extract code from editor
  extractCode()
    .then(codeData => {
      if (!codeData.code) {
        statusElement.textContent = 'Error: Could not find solution code';
        return;
      }
      
      if (!problemData) {
        extractProblemData();
      }
      
      // Combine problem data with code
      const solutionData = {
        ...problemData,
        ...codeData
      };
      
      // Send solution to background script for saving
      statusElement.textContent = 'Saving solution...';
      chrome.runtime.sendMessage(
        { 
          type: 'SAVE_SOLUTION', 
          solution: solutionData 
        }, 
        (response) => {
          if (response.success) {
            statusElement.textContent = 'Solution saved successfully!';
            statusElement.style.color = '#38a169'; // Green color
            
            // Reset color after 3 seconds
            setTimeout(() => {
              statusElement.style.color = '#666';
            }, 3000);
          } else {
            statusElement.textContent = `Error: ${response.error}`;
            statusElement.style.color = '#e53e3e'; // Red color
          }
        }
      );
    })
    .catch(error => {
      statusElement.textContent = `Error: ${error.message}`;
      statusElement.style.color = '#e53e3e'; // Red color
    });
}

// Extract code from the editor
async function extractCode() {
  // Wait a bit for the editor to be fully loaded
  await new Promise(resolve => setTimeout(resolve, 500));

  // --- Language Detection ---
  let language = 'javascript'; // Default fallback

  // 1. Try to get language from the first button inside #editor (most reliable for new LeetCode UI)
  const editorDiv = document.getElementById('editor');
  if (editorDiv) {
    const firstButton = editorDiv.querySelector('button');
    if (firstButton && firstButton.textContent) {
      language = firstButton.textContent.trim().toLowerCase();
    }
  }

  // 2. Fallback: Try to get language from the language dropdown (LeetCode's new UI)
  if (!language || language === 'javascript') {
    let langBtn = document.querySelector('button[data-cy="lang-select-btn"]');
    if (langBtn && langBtn.textContent) {
      language = langBtn.textContent.trim().toLowerCase();
    }
  }

  // 3. Fallback: Try to get language from the select dropdown (LeetCode's old UI)
  if (!language || language === 'javascript') {
    let langSelect = document.querySelector('select[data-cy="lang-select"]');
    if (langSelect && langSelect.value) {
      language = langSelect.value.trim().toLowerCase();
    }
  }

  // 4. Fallback: Try to get language from the Monaco editor aria-label
  if (!language || language === 'javascript') {
    let monaco = document.querySelector('.monaco-editor');
    if (monaco && monaco.getAttribute('aria-label')) {
      const aria = monaco.getAttribute('aria-label');
      const match = aria.match(/;\s*([A-Za-z0-9+#]+)/);
      if (match && match[1]) {
        language = match[1].toLowerCase();
      }
    }
  }

  // 5. Map LeetCode language names to backend-supported names
  const languageMap = {
    'javascript': 'javascript',
    'typescript': 'typescript',
    'python': 'python',
    'python3': 'python',
    'java': 'java',
    'c++': 'cpp',
    'cpp': 'cpp',
    'c': 'c',
    'c#': 'csharp',
    'csharp': 'csharp',
    'ruby': 'ruby',
    'swift': 'swift',
    'kotlin': 'kotlin',
    'golang': 'go',
    'go': 'go',
    'scala': 'scala',
    'rust': 'rust',
    'php': 'php'
  };
  language = languageMap[language] || language;

  // --- Code Extraction ---
  let code = '';
  // 1. Try textarea (sometimes present)
  let codeElements = document.querySelectorAll('textarea[data-monaco-editor="true"], .CodeMirror-code pre');
  if (codeElements.length > 0) {
    code = codeElements[0].value || codeElements[0].textContent;
  } else {
    // 2. Try Monaco editor lines
    const codeLines = document.querySelectorAll('.monaco-editor .view-line');
    if (codeLines.length > 0) {
      code = Array.from(codeLines)
        .map(line => line.textContent)
        .join('\n');
    } else {
      // 3. Try submission code
      const submissionCode = document.querySelector('div[data-cy="solution-content"]');
      if (submissionCode) {
        code = submissionCode.textContent;
      } else {
        // 4. Last resort: clipboard
        try {
          code = await navigator.clipboard.readText();
        } catch (e) {
          throw new Error('Could not extract code from editor');
        }
      }
    }
  }

  // --- Normalize Spaces ---
  // Replace non-breaking spaces (\u00A0) with regular spaces (\u0020)
  code = code.replace(/\u00A0/g, ' ');

  // --- Clean Up Code ---
  // Remove trailing whitespaces from each line
  code = code
    .split('\n')
    .map(line => line.trimEnd()) // Trim trailing spaces
    .join('\n');

  return { code, language };
}

// Open the login popup
function openLoginPopup() {
  chrome.runtime.sendMessage({ type: 'OPEN_LOGIN_POPUP' });
}

// Logout from the extension
function logout() {
  chrome.runtime.sendMessage({ type: 'LOGOUT' }, (response) => {
    if (response.success) {
      // Update UI after logout
      checkAuthentication();
      
      // Show status
      const statusElement = document.getElementById('collab-ide-status');
      statusElement.textContent = 'Logged out successfully';
    }
  });
}

// View solutions in Collab IDE
function viewSolutions() {
  // Open the Collab IDE solutions page in a new tab
  chrome.runtime.sendMessage({ type: 'CHECK_AUTH' }, (response) => {
    if (response.isAuthenticated) {
      // window.open('http://localhost:5173/leetcode', '_blank');
      window.open('https://colab-ide.vercel.app/leetcode', '_blank');
    } else {
      const statusElement = document.getElementById('collab-ide-status');
      statusElement.textContent = 'Please log in first to view your solutions';
      statusElement.style.color = '#e53e3e'; // Red color
    }
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXTENSION_STATE_CHANGED') {
    isEnabled = message.isEnabled;
    
    if (isEnabled && !floatingButton) {
      createFloatingButton();
      extractProblemData();
    } else if (!isEnabled && floatingButton) {
      floatingButton.remove();
      floatingButton = null;
      
      if (actionPanel) {
        actionPanel.remove();
        actionPanel = null;
      }
    }
  }
  
  sendResponse({ success: true });
});

// Wait for page to be fully loaded
window.addEventListener('load', initializeUI);

// Also try to initialize if we're already on a fully loaded page
if (document.readyState === 'complete') {
  initializeUI();
}

// Re-initialize when URL changes (for SPA navigation)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    
    // Reset state
    problemData = null;
    
    // Remove existing UI if present
    if (floatingButton) {
      floatingButton.remove();
      floatingButton = null;
    }
    
    if (actionPanel) {
      actionPanel.remove();
      actionPanel = null;
    }
    
    // Re-initialize
    setTimeout(initializeUI, 1000); // Wait a bit for the page to load
  }
}).observe(document, { subtree: true, childList: true });
