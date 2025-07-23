const express = require('express');
const session = require('express-session'); // For managing user sessions
const passport = require('passport'); // Authentication middleware
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Google OAuth strategy
const stripe = require('stripe'); // Stripe payment processing
const cors = require('cors'); // Cross-origin resource sharing
const path = require('path'); // File path utilities
require('dotenv').config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000; // Use environment port or default to 3000

const stripeInstance = process.env.STRIPE_SECRET_KEY ? stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from public directory

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key', // Secret for signing session cookies
  resave: false, // Don't save session if unmodified
  saveUninitialized: false, // Don't create session until something stored
  cookie: { secure: false } // Set to true in production with HTTPS
}));

app.use(passport.initialize());
app.use(passport.session()); // Enable persistent login sessions

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Google OAuth client ID
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Google OAuth client secret
    callbackURL: "/auth/google/callback" // Callback URL after Google authentication
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      photo: profile.photos[0].value
    };
    return done(null, user); // Pass user to Passport
  }));
}

passport.serializeUser((user, done) => {
  done(null, user); // Store entire user object in session
});

passport.deserializeUser((user, done) => {
  done(null, user); // Retrieve user object from session
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next(); // User is authenticated, proceed to next middleware
  }
  res.status(401).json({ error: 'Not authenticated' }); // Return error if not authenticated
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }) // Request profile and email access
  );

  app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }), // Authenticate with Google, redirect to home on failure
    (req, res) => {
      res.redirect('/dashboard'); // Redirect to dashboard on successful authentication
    }
  );

  app.get('/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout failed' });
      }
      res.redirect('/'); // Redirect to home page after logout
    });
  });
} else {
  app.get('/auth/google', (req, res) => {
    res.status(501).json({ 
      error: 'Google OAuth not configured', 
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables to enable authentication. See the tutorial for setup instructions.' 
    });
  });

  app.get('/auth/logout', (req, res) => {
    res.redirect('/');
  });
}

app.get('/api/user', ensureAuthenticated, (req, res) => {
  res.json(req.user); // Return user object as JSON
});

app.get('/api/config', (req, res) => {
  if (!process.env.STRIPE_PUBLISHABLE_KEY) {
    return res.status(501).json({ 
      error: 'Stripe not configured', 
      message: 'Please set STRIPE_PUBLISHABLE_KEY environment variable to enable payments. See the tutorial for setup instructions.' 
    });
  }
  
  res.json({
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY // Send publishable key to frontend
  });
});

app.post('/api/create-payment-intent', ensureAuthenticated, async (req, res) => {
  if (!stripeInstance) {
    return res.status(501).json({ 
      error: 'Stripe not configured', 
      message: 'Please set STRIPE_SECRET_KEY environment variable to enable payments. See the tutorial for setup instructions.' 
    });
  }

  try {
    const { amount, currency = 'usd' } = req.body; // Extract amount and currency from request

    if (!amount || amount < 50) {
      return res.status(400).json({ error: 'Amount must be at least $0.50' });
    }

    const paymentIntent = await stripeInstance.paymentIntents.create({
      amount: amount, // Amount in cents
      currency: currency, // Currency code (default: USD)
      metadata: {
        userId: req.user.id, // Store user ID for reference
        userEmail: req.user.email // Store user email for reference
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

app.post('/api/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature']; // Get Stripe signature from headers
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.log(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true }); // Acknowledge receipt of webhook
});

app.get('/dashboard', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Tutorial Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('📚 TUTORIAL MODE:');
  console.log('   • Tutorial content is accessible without authentication');
  console.log('   • View comprehensive code examples and explanations');
  console.log('   • Learn Google OAuth and Stripe integration step-by-step');
  console.log('');
  
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log('⚠️  Google OAuth: DISABLED (credentials not configured)');
    console.log('   To enable: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
  } else {
    console.log('✅ Google OAuth: ENABLED');
  }
  
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PUBLISHABLE_KEY) {
    console.log('⚠️  Stripe Payments: DISABLED (credentials not configured)');
    console.log('   To enable: Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY in .env');
  } else {
    console.log('✅ Stripe Payments: ENABLED');
  }
  
  console.log('');
  console.log('🎓 Ready to learn! Open your browser and start the tutorial.');
});
