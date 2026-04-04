// Middleware that checks if the already-verified user is the admin.
// MUST be used AFTER verifyToken — it relies on req.user being set.
// The admin email is read from process.env.ADMIN_EMAIL so it is never
// visible in source code.

export const isAdmin = (req, res, next) => {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail  = req.user?.email?.trim().toLowerCase();

  if (!adminEmail) {
    // Env var not set — fail safely, do not grant access
    return res.status(500).json({ error: "Admin not configured." });
  }

  if (userEmail !== adminEmail) {
    return res.status(403).json({ error: "Admin access only." });
  }

  next();
};
