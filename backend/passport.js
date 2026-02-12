import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "./models/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile) {
          return done(new Error("No profile received from Google"), null);
        }

        const email = profile?.emails?.[0]?.value?.toLowerCase() || null;

        if (!email) {
          return done(new Error("No email returned from Google"), null);
        }

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
        console.error("🔥 GOOGLE STRATEGY ERROR:", error);
        return done(error, null);
      }
    }
  )
);

export default passport;
