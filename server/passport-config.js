const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
//const users = require("./controllers/userModel");

function initialize(passport, getUserByEmail, getUserById) {
  const authenticateUser = async (email, password, done) => {
    const user = await getUserByEmail(email);
    console.log(password);
    // console.log(user);
    if (user == null) {
      console.log("user is null");
      return done(null, false, { message: "No user with that email" });
    }
    console.log(await bcrypt.compare(password, user.password));
    try {
      if (await bcrypt.compare(password, user.password)) {
        console.log("success");
        return done(null, user);
      } else {
        return done(null, false, { message: "Password incorrect" });
      }
    } catch (e) {
      return done(e);
    }
  };

  passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser((id, done) => {
    getUserById(id).then((user) => {
      return done(null, user);
    });
  });
}

module.exports = initialize;
