import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";

const router = express.Router();

/*
|--------------------------------------------------------------------------
| GOOGLE LOGIN
|--------------------------------------------------------------------------
*/
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/*
|--------------------------------------------------------------------------
| GOOGLE CALLBACK
|--------------------------------------------------------------------------
*/
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login`);
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Redirect back to frontend with token
      return res.redirect(
        `${process.env.FRONTEND_URL}/?token=${token}`
      );

    } catch (error) {
      console.error("Google callback error:", error);
      return res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);

export default router;
