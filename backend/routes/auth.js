router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    try {
      console.log("Callback hit");

      if (!req.user) {
        console.log("No user found");
        return res.status(401).send("User not found");
      }

      if (!process.env.JWT_SECRET) {
        console.log("JWT_SECRET missing");
        return res.status(500).send("Server config error");
      }

      const token = jwt.sign(
        { id: req.user._id, email: req.user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      console.log("Token created successfully");

      return res.redirect(
        `${process.env.FRONTEND_URL}/auth-success?token=${token}`
      );
    } catch (error) {
      console.error("GOOGLE CALLBACK ERROR:", error);
      return res.status(500).send("Internal Server Error");
    }
  }
);
