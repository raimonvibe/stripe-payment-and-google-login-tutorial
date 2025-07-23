document.addEventListener('DOMContentLoaded', function() {
    console.log('Stripe Payment & Google Login Tutorial loaded');
    
    initializeTheme();
    
    const loginBtn = document.querySelector('.google-login-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            console.log('Google login initiated');
        });
    }
    
    checkAuthStatus();
});

/**
 * Initialize theme functionality
 * Set up dark mode toggle button and load saved theme preference
 */
function initializeTheme() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '🌙'; // Moon icon for dark mode
    themeToggle.setAttribute('aria-label', 'Toggle dark mode');
    themeToggle.title = 'Toggle dark/light mode';
    
    document.body.appendChild(themeToggle);
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        
        localStorage.setItem('theme', newTheme);
        
        console.log(`Theme switched to: ${newTheme}`);
    });
}

/**
 * Set the theme for the application
 * @param {string} theme - Either 'light' or 'dark'
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        if (theme === 'dark') {
            themeToggle.innerHTML = '☀️'; // Sun icon for light mode
            themeToggle.title = 'Switch to light mode';
        } else {
            themeToggle.innerHTML = '🌙'; // Moon icon for dark mode
            themeToggle.title = 'Switch to dark mode';
        }
    }
    
    console.log(`Theme set to: ${theme}`);
}

/**
 * Check if the user is already authenticated
 * If authenticated, redirect to dashboard
 * If not authenticated, stay on the login page
 */
async function checkAuthStatus() {
    try {
        // Make API call to check if user is authenticated
        const response = await fetch('/api/user');
        if (response.ok) {
            // User is authenticated, redirect to dashboard
            window.location.href = '/dashboard';
        }
        // If response is not ok (401), user is not authenticated - stay on login page
    } catch (error) {
        // Network error or user not authenticated
        console.log('User not authenticated');
    }
}
