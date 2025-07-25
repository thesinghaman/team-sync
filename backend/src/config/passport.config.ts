import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

import { verifyUserService } from "../services/auth.service";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false,
    },
    async (email, password, done) => {
      try {
        const user = await verifyUserService({ email, password });
        return done(null, user);
      } catch (error: any) {
        // For authentication failures (wrong password, user not found, etc.)
        // we should return done(null, false, info) not done(error, false, info)
        return done(null, false, {
          message: error?.message || "Invalid email or password",
        });
      }
    }
  )
);
