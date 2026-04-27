const requireAdmin = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = req.user?.email?.toLowerCase();
  const isAdmin = req.user?.role === 'admin' || req.user?.isAdmin || adminEmails.includes(userEmail);

  if (!isAdmin) {
    return res.status(403).json({ error: 'Admin access required.' });
  }

  next();
};

module.exports = requireAdmin;
