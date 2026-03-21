import admin from "firebase-admin";

export const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    if (!decoded.email.endsWith("@vcet.edu.in")) {
      return res.status(403).json({ error: "Access restricted to VCET students." });
    }
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
};
