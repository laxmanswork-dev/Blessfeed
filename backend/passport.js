import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,

      // 🔥 Hardcoded temporarily to remove env confusion
      callbackURL: "https://blessfeed-backend.onrender.com/api/auth/google/callback",
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email received from Google"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            email,
            googleId: profile.id,
            authProvider: "google",
            isVerified: true,
          });
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
