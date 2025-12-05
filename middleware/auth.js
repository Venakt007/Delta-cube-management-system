const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

const isRecruiterOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'recruiter' && req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Recruiter or Admin access required' });
  }
  next();
};

const isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ error: 'Super Admin access required' });
  }
  next();
};

// Alias for consistency
const authenticateToken = auth;

module.exports = { auth, authenticateToken, isAdmin, isRecruiterOrAdmin, isSuperAdmin };
