# Complete Demo Guide: Stripe Payments + Google OAuth

This guide demonstrates how to build a complete web application with Google OAuth authentication and Stripe payment processing.

## 🚀 Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/raimonvibe/stripe-payment-and-google-login-tutorial.git
cd stripe-payment-and-google-login-tutorial
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your actual API keys (see setup instructions below)
```

4. **Start the application**
```bash
npm start
```

5. **Open your browser**
```
http://localhost:3000
```

## 🔧 Detailed Setup Instructions

### Stripe Configuration

1. **Create a Stripe Account**
   - Go to [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register)
   - Sign up for a free account

2. **Get API Keys**
   - Navigate to **Developers > API keys**
   - Copy your **Publishable key** (starts with `pk_test_`)
   - Copy your **Secret key** (starts with `sk_test_`)
   - Add these to your `.env` file

3. **Test Card Numbers**
   - **Success**: `4242 4242 4242 4242`
   - **Declined**: `4000 0000 0000 0002`
   - **Insufficient Funds**: `4000 0000 0000 9995`
   - Use any future expiry date and any 3-digit CVC

### Google OAuth Configuration

1. **Create Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Go to **APIs & Services > Library**
   - Search for "Google+ API" and enable it

3. **Create OAuth Credentials**
   - Go to **APIs & Services > Credentials**
   - Click **Create Credentials > OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
   - Copy the **Client ID** and **Client Secret**
   - Add these to your `.env` file

## 🎨 Features Demonstrated

### 1. Google OAuth Authentication
- **Login Flow**: Users click "Sign in with Google" → redirected to Google → authenticated → redirected back
- **Session Management**: User sessions are maintained securely using Passport.js
- **User Data**: Access to user's name, email, and profile photo
- **Logout**: Secure logout that destroys the session

### 2. Stripe Payment Processing
- **Payment Intents**: Secure server-side payment intent creation
- **Card Collection**: Stripe Elements for secure card data collection
- **Payment Confirmation**: Client-side payment confirmation with Stripe.js
- **Error Handling**: Comprehensive error handling for failed payments
- **Webhooks**: Server endpoint for handling Stripe webhook events

### 3. Dark Mode Toggle
- **Theme Switching**: Toggle between light (beige) and dark (black/orange) themes
- **Persistent Preference**: Theme choice saved in localStorage
- **Smooth Transitions**: CSS transitions for seamless theme switching
- **Responsive Design**: Works on all device sizes

## 📁 Project Structure

```
├── server/
│   └── server.js              # Express server with all routes and middleware
├── public/
│   ├── index.html            # Landing page with Google login
│   ├── dashboard.html        # Payment dashboard (authenticated users only)
│   ├── style.css            # Comprehensive CSS with dark mode support
│   ├── script.js            # Landing page JavaScript with theme toggle
│   └── dashboard.js         # Dashboard JavaScript with Stripe integration
├── package.json             # Dependencies and scripts
├── .env.example            # Environment variables template
├── .gitignore              # Git ignore rules
└── README.md               # Project documentation
```

## 🔐 Security Features

### Authentication Security
- **OAuth 2.0**: Industry-standard authentication protocol
- **Session Management**: Secure session cookies with proper configuration
- **Route Protection**: Middleware to protect authenticated routes
- **CSRF Protection**: Session-based CSRF protection

### Payment Security
- **Server-side Processing**: All sensitive operations on the server
- **No Card Data Storage**: Card data never touches your servers
- **PCI Compliance**: Stripe handles PCI compliance requirements
- **Webhook Verification**: Verify webhook signatures (when configured)

## 🧪 Testing the Application

### Testing Authentication
1. Click "Sign in with Google" on the homepage
2. Complete Google OAuth flow
3. Verify redirect to dashboard with user info displayed
4. Test logout functionality

### Testing Payments
1. Ensure you're authenticated (logged in)
2. Enter a test amount (minimum $0.50)
3. Use test card number: `4242 4242 4242 4242`
4. Use any future expiry date and any 3-digit CVC
5. Click "Pay Now" and verify success message

### Testing Dark Mode
1. Click the theme toggle button (🌙/☀️) in the top-right corner
2. Verify smooth transition between themes
3. Refresh the page to confirm theme persistence
4. Test on both landing page and dashboard

## 🚨 Common Issues & Solutions

### Google OAuth Issues
- **"redirect_uri_mismatch"**: Ensure redirect URI in Google Console matches exactly
- **"invalid_client"**: Check that Client ID and Secret are correct
- **"access_denied"**: User cancelled OAuth flow - this is normal

### Stripe Payment Issues
- **"Your card was declined"**: Use test card `4242 4242 4242 4242`
- **"Amount too small"**: Minimum amount is $0.50 (50 cents)
- **"Invalid API key"**: Check that your Stripe keys are correct and for the right mode

### General Issues
- **Port already in use**: Change PORT in .env or kill existing process
- **Module not found**: Run `npm install` to install dependencies
- **Environment variables not loaded**: Ensure .env file exists and is properly formatted

## 📚 Code Examples

### Creating a Payment Intent (Server-side)
```javascript
// Create payment intent with user metadata
const paymentIntent = await stripe.paymentIntents.create({
  amount: amount, // Amount in cents
  currency: 'usd',
  metadata: {
    userId: req.user.id,
    userEmail: req.user.email
  }
});
```

### Confirming Payment (Client-side)
```javascript
// Confirm payment with Stripe Elements
const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
  }
});
```

### Theme Toggle Implementation
```javascript
// Toggle between light and dark themes
function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}
```

## 🌟 Next Steps

### Production Deployment
1. **Environment Variables**: Use proper environment variable management
2. **HTTPS**: Enable HTTPS for production (required for OAuth and Stripe)
3. **Database**: Add a real database for user and payment data
4. **Error Monitoring**: Add error tracking (Sentry, LogRocket, etc.)
5. **Rate Limiting**: Add rate limiting to prevent abuse

### Feature Enhancements
1. **User Profiles**: Store additional user information
2. **Payment History**: Track and display payment history
3. **Subscription Billing**: Add recurring payment support
4. **Email Notifications**: Send payment confirmations via email
5. **Admin Dashboard**: Add admin interface for managing users/payments

## 📞 Support

If you encounter any issues:
1. Check the console for error messages
2. Verify your API keys are correct
3. Ensure all environment variables are set
4. Check that redirect URIs match exactly
5. Review the detailed comments in the code

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Happy coding! 🎉**

This demo provides a solid foundation for building applications with authentication and payment processing. Feel free to extend and customize it for your specific needs.
