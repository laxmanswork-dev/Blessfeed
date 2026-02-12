import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

// Step 1 — Google Login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Step 2 — Google Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).send("User not found");
      }

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect to frontend with token
      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-success?token=${token}`
      );
    } catch (error) {
      console.error("Google callback error:", error);
      return res.status(500).send("Authentication failed");
    }
  }
);

export default router;
