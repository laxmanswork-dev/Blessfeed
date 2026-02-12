import express from "express";
import passport from "passport";

const router = express.Router();

/* GOOGLE LOGIN */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

/* GOOGLE CALLBACK */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  (req, res) => {
    try {
      return res.redirect(process.env.FRONTEND_URL);
    } catch (error) {
      console.error("🔥 CALLBACK ERROR:", error);
      return res.status(500).send("Internal server error");
    }
  }
);

router.get("/failure", (req, res) => {
  res.status(401).send("Authentication Failed");
});

export default router;
