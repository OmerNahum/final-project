const passport = require("passport");
const GoogleStratergy = require("passport-google-oauth20").Strategy;
const keys = require("./keys");
const User = require("./controllers/userModel");
const axios = require("axios");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => {
    done(null, user);
  });
});

passport.use(
  new GoogleStratergy(
    {
      clientID: keys.googleId,
      clientSecret: keys.googleSecret,
      callbackURL: "http://localhost:3000/user/google/redirect",
    },
    async (accessToken, refreshToken, profile, done) => {
      const res = await axios.get(
        `https://www.google.com/m8/feeds/contacts/default/full?alt=json&oauth_token=${accessToken}`
      );

      var entries = res.data.feed.entry;

      const emails = entries.map((entry) => {
        if (
          entry.gd$email &&
          entry.gd$email.length > 0 &&
          entry.gd$email[0].address !== ""
        )
          return entry.gd$email[0].address;
      });

      const existingUser = await User.findOne({
        email: profile.emails[0].value,
      });
      if (existingUser) {
        return done(null, existingUser);
      }

      const contacts1 = await User.find({ email: { $in: emails } });
      console.log("profile", profile);
      const newUser = await new User({
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        contacts: contacts1,
        email: profile.emails[0].value,
        image: profile.photos[0].value,
      }).save();
      done(null, newUser);
    }
  )
);
