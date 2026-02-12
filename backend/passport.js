import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        "https://blessfeed-backend.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // ✅ Safely extract and normalize email
        const rawEmail =
          profile?.emails?.[0]?.value ||
          profile?._json?.email ||
          null;

        if (!rawEmail) {
          return done(new Error("No email returned from Google"), null);
        }

        const email = rawEmail.toLowerCase().trim();

        // ✅ Find user safely
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            googleId: profile.id,
            authProvider: "google",
            isVerified: true,
            lastLoginAt: new Date(),
          });
        } else {
          user.googleId = profile.id;
          user.lastLoginAt = new Date();
          await user.save();
        }

        return done(null, user);
      } catch (error) {
        console.error("Google OAuth Error:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;
