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
    failureRedirect: "/auth-failed",
  }),
  (req, res) => {
    // Success
    res.redirect(process.env.FRONTEND_URL);
  }
);

export default router;
