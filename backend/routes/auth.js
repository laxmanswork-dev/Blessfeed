import express from "express";
import passport from "passport";

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
    session: false,
  }),
  (req, res) => {
    try {
      // After successful login redirect to frontend
      return res.redirect("https://blessfeed-1.onrender.com");
    } catch (err) {
      console.error("Google callback error:", err);
      return res.status(500).send("Internal Server Error");
    }
  }
);

export default router;
