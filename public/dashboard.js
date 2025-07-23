let stripe; // Main Stripe object
let elements; // Stripe Elements object for creating form elements
let card; // Card element for collecting payment information

document.addEventListener('DOMContentLoaded', async function() {
    initializeTheme(); // Set up dark mode toggle and load theme preference
    await initializeStripe(); // Set up Stripe with publishable key
    await loadUserInfo(); // Load and display user information
    setupPaymentForm(); // Set up payment form event handlers
});

/**
 * Initialize Stripe with the publishable key from the server
 * Create and mount the card element for payment input
 */
async function initializeStripe() {
    try {
        const response = await fetch('/api/config');
        const { publishableKey } = await response.json();
        
        stripe = Stripe(publishableKey);
        elements = stripe.elements();
        
        const style = {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
            },
        };
        
        card = elements.create('card', { style });
        card.mount('#card-element');
        
        card.on('change', function(event) {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
                displayError.textContent = event.error.message;
            } else {
                displayError.textContent = '';
            }
        });
        
    } catch (error) {
        console.error('Error initializing Stripe:', error);
    }
}

/**
 * Load authenticated user information and display it in the UI
 * Redirect to login page if user is not authenticated
 */
async function loadUserInfo() {
    try {
        const response = await fetch('/api/user');
        if (response.ok) {
            const user = await response.json();
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userPhoto').src = user.photo;
        } else {
            window.location.href = '/';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
        window.location.href = '/';
    }
}

/**
 * Set up event handlers for the payment form
 * Handle form submission and payment processing
 */
function setupPaymentForm() {
    const form = document.getElementById('payment-form');
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission
        
        const submitButton = document.getElementById('submit-button');
        const buttonText = document.getElementById('button-text');
        const spinner = document.getElementById('spinner');
        
        submitButton.disabled = true;
        buttonText.style.display = 'none';
        spinner.classList.remove('hidden');
        
        try {
            const amount = Math.round(parseFloat(document.getElementById('amount').value) * 100);
            
            if (amount < 50) {
                throw new Error('Amount must be at least $0.50');
            }
            
            const { clientSecret } = await createPaymentIntent(amount);
            
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: card, // Use the card element for payment method
                }
            });
            
            if (error) {
                throw error;
            } else {
                showPaymentSuccess();
            }
            
        } catch (error) {
            console.error('Payment error:', error);
            document.getElementById('card-errors').textContent = error.message;
        } finally {
            submitButton.disabled = false;
            buttonText.style.display = 'inline';
            spinner.classList.add('hidden');
        }
    });
}

/**
 * Create a payment intent on the server
 * @param {number} amount - Amount in cents
 * @returns {Promise<Object>} Payment intent with client secret
 */
async function createPaymentIntent(amount) {
    const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }), // Send amount in request body
    });
    
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create payment intent');
    }
    
    return response.json(); // Return the payment intent data
}

/**
 * Initialize theme functionality for dashboard
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
 * Show payment success message and reset form after delay
 */
function showPaymentSuccess() {
    document.getElementById('payment-form').style.display = 'none';
    document.getElementById('payment-result').classList.remove('hidden');
    
    setTimeout(() => {
        document.getElementById('payment-form').style.display = 'block';
        document.getElementById('payment-result').classList.add('hidden');
        
        document.getElementById('payment-form').reset();
        document.getElementById('amount').value = '10.00';
        document.getElementById('description').value = 'Test Payment';
        
        card.clear();
    }, 5000); // 5 second delay
}
