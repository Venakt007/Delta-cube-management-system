const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/technologies', require('./routes/technologies'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve application form (for social media sharing) - Always available
app.get('/apply.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/public/apply.html'));
});

// Serve static files from React build for dashboard routes
if (process.env.NODE_ENV === 'production') {
  // Production: Serve React build
  app.use(express.static(path.join(__dirname, 'client/build')));
  
  // Serve landing page at root in production
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/public/landing.html'));
  });
  
  // Handle React routing for dashboard (login, admin, recruiter)
  app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
  
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
  
  app.get('/recruiter', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
} else {
  // Development mode: Proxy to React dev server
  console.log('Development mode: React app should be running on port 3000');
  console.log('Access:');
  console.log('  - Landing page: http://localhost:5000/landing.html');
  console.log('  - Application form: http://localhost:5000/apply.html');
  console.log('  - React app (login/dashboards): http://localhost:3000');
  
  // Serve landing page in development
  app.get('/landing.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/public/landing.html'));
  });
  
  // Redirect root to React dev server in development
  app.get('/', (req, res) => {
    res.redirect('http://localhost:3000');
  });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
