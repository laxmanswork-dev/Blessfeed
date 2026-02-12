import express from "express";

const router = express.Router();

// Example health check route (optional)
router.get("/", (req, res) => {
  res.status(200).json({ message: "Auth route working" });
});

export default router;
