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
    failureRedirect: process.env.FRONTEND_URL,
  }),
  (req, res) => {
    // Successful login → redirect to frontend
    return res.redirect(process.env.FRONTEND_URL);
  }
);

export default router;
