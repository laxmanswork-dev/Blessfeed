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
  (req, res, next) => {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err) {
        console.error("OAuth Error:", err);
        return res.status(500).send("Authentication failed");
      }

      if (!user) {
        return res.status(401).send("Authentication failed");
      }

      return res.redirect(process.env.FRONTEND_URL);
    })(req, res, next);
  }
);

export default router;
