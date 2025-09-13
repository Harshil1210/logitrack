import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import userModel from "../models/user.model";
import { config } from "@logitrack/config";

const clientId = config.google.clientId;
const clientSecret = config.google.clientSecret;
const callbackURL = config.google.callbackUrl;

passport.use(
  new GoogleStrategy(
    {
      clientID: clientId,
      clientSecret: clientSecret,
      callbackURL: callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await userModel.findOne({ googleId: profile.id });

        if (existingUser) return done(null, existingUser);
        const newUser = await userModel.create({
          googleId: profile.id,
          email: profile.emails?.[0]?.value,
          role: "user",
        });
        return done(null, newUser);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
