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
| GOOGLE CALLBACK (STABLE VERSION)
|--------------------------------------------------------------------------
*/
router.get("/google/callback", (req, res, next) => {
  passport.authenticate(
    "google",
    { session: false },
    (err, user, info) => {
      if (err) {
        console.error("OAuth error:", err);
        return res.status(500).send("Authentication failed");
      }

      if (!user) {
        console.error("No user returned from Google");
        return res.status(401).send("Authentication failed");
      }

      try {
        // SUCCESS → Redirect to frontend
        return res.redirect("https://blessfeed-1.onrender.com");
      } catch (error) {
        console.error("Redirect error:", error);
        return res.status(500).send("Redirect failed");
      }
    }
  )(req, res, next);
});

export default router;
