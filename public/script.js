document.addEventListener('DOMContentLoaded', function() {
    console.log('Google OAuth + Stripe Tutorial loaded');
    
    initializeTheme();
    initializeNavigation();
    initializeSmoothScrolling();
    
    const loginBtn = document.querySelector('.google-login-btn');
    
    if (loginBtn) {
        loginBtn.addEventListener('click', function(e) {
            console.log('Google login initiated');
        });
    }
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
 * Initialize smooth scrolling for navigation links
 */
function initializeSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
}

/**
 * Initialize navigation highlighting based on scroll position
 */
function initializeNavigation() {
    const sections = document.querySelectorAll('.tutorial-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function updateActiveNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Call once on load
}

/**
 * Check if the user is already authenticated (for demo purposes)
 * This is optional and doesn't block tutorial content
 */
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const user = await response.json();
            console.log('User is authenticated:', user.name);
            
            const demoSection = document.querySelector('#demo .demo-card');
            if (demoSection) {
                const authStatus = document.createElement('div');
                authStatus.className = 'auth-status';
                authStatus.innerHTML = `
                    <p style="color: #4CAF50; font-weight: bold;">
                        ✓ Authenticated as ${user.name}
                    </p>
                    <a href="/dashboard" style="color: var(--gradient-primary);">
                        Go to Payment Dashboard →
                    </a>
                `;
                demoSection.appendChild(authStatus);
            }
        }
    } catch (error) {
        console.log('User not authenticated - tutorial content still accessible');
    }
}
