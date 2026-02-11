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
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
    session: false,
  }),
  async (req, res) => {
    try {
      // generate token (if you already have JWT logic use that)
      const token = "google-login-success"; // replace with real JWT if needed

      // redirect back to frontend with token
      res.redirect(
        `${process.env.FRONTEND_URL}/login-success?token=${token}`
      );
    } catch (err) {
      res.redirect(`${process.env.FRONTEND_URL}/login`);
    }
  }
);
