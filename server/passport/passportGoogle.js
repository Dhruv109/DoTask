const passport = require("passport");

const googleStrategy = require("passport-google-oauth20").Strategy;
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const googleUser = require("../models/googleUser.js");

function initialiseGoogle(passport, getUserById) {
  const authenticateFromGoggle = async (
    accessToken,
    refreshToken,
    profile,
    cb
  ) => {
    try {
      const user = await googleUser.findOne({ id: profile.id });
      if (user) {
        return cb(null, user);
      } else {
        const newUser = new googleUser({
          id: profile.id,
          name: profile.name.givenName,
          email: profile.emails[0].value,
        });
        const savedUser = await newUser.save();
        return cb(null, savedUser);
      }
    } catch (err) {
      console.log(err);
      return cb(err, null);
    }
  };

  passport.use(
    new googleStrategy(
      {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/callback",
      },
      authenticateFromGoggle
    )
  );
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  passport.deserializeUser((id, done) => {
    done(null, getUserById(id));
  });
}

module.exports = initialiseGoogle;
