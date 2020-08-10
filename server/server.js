/* eslint-disable no-unused-vars */
const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;
const chatRoutes = require("./routes/chat");
const bodyParser = require("body-parser");
const passport = require("passport");
const userRoutes = require("./routes/user");
const flash = require("express-flash");
const User = require("./controllers/userModel");
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const initializePassport = require("./passport-config");
const socketio = require("socket.io");
const mongoose = require("./database");
const Groups = require("./controllers/groupModel");
const googleInit = require("./google-passport");
const fileUpload = require("express-fileupload");
const moment = require("moment");
const Group = require("./controllers/groupModel");
app.use(fileUpload());

initializePassport(
  passport,
  (email) => User.findOne({ email }),
  (_id) => User.findById({ _id })
);

// initializePassport(passport, (email) => {
//   return User.findOne({ email });
// });
// app.use(function(req, res, next) {
//   // Website you wish to allow to connect
//   res.setHeader("Access-Control-Allow-Origin", "http://localhost:8080");
//   res.setHeader("Content-Type", "application/json");
//   next();
// });

app.use(
  cookieSession({
    maxAge: 30 * 24 * 60 * 60 * 1000,
    keys: ["ljqelkqjnekwjrkewlklnkjjkjkb"],
  })
);

app.use(cors());
app.use(require("body-parser").urlencoded({ extended: true }));
app.use(flash());
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.

app.use("/user", userRoutes);

const server = app.listen(port, (err) => {
  if (err) {
    return console.log("something bad happened", err);
  }

  console.log(`server is listening on ${port}`);
});

app.use("/chat", chatRoutes);
const io = socketio(server);
io.on("connection", (socket) => {
  socket.on("join", async ({ group, roomId, _id }, callback) => {
    const chatGroup = group;
    const room = await Groups.findById(roomId);
    if (room) {
      room.viewed.find(
        (view) => view._id.toString() === _id.toString()
      ).isViewed = true;
      await room.save();
    }
    if (!chatGroup) callback("can't entered chat");
    //console.log("join", roomId);
    socket.join(roomId);
    callback();
  });
  socket.on("view", async ({ group, roomId, _id }, callback) => {
    const room = await Groups.findById(roomId);
    if (room) {
      room.viewed.find(
        (view) => view._id.toString() === _id.toString()
      ).isViewed = true;
      await room.save();
    }
  });
  socket.on("onChange", async (group) => {
    console.log("onChange", group.group);
    let g = await Groups.findById(group.group._id);
    console.log("onChange", g);
    if (g) {
      //console.log("onChange", g);
      g.name = group.group.name;
      g.closingTime = group.group.closingTime;
      g.image = group.group.image;

      await g.save();
    }

    io.emit("change", { group: g });
  });
  // socket.on("lastSeen", async ({ time, u }) => {
  //   console.log("time--+-", time);
  //   let user = await User.findById(u._id);
  //   user.lastSeen = time;
  //   await user.save();
  //   io.emit("updateFinished");
  // });
  socket.on("onGroupDelete", () => {
    console.log("onGroupDelete");
    io.emit("groupDeleted");
  });

  socket.on("sendMessage", async ({ user, roomId, message }, callback) => {
    const room = await Groups.findById(roomId);

    if (room) {
      //"image/png, image/jpeg, image/bmp"
      // if (
      //   message.endsWith(".png") ||
      //   message.endsWith(".jpeg") ||
      //   message.endsWith(".bmp")
      // ) {
      //   room.messages.push({
      //     user: user.firstName,
      //     message: message,
      //   });
      //   await room.save();
      // } else {
      if (
        message.endsWith(".png") ||
        message.endsWith(".jpeg") ||
        message.endsWith(".bmp") ||
        message.endsWith(".jpg")
      ) {
        room.messages.push({ user: " ", message: "\n \n \n \n" });
      }
      room.messages.push({ user: user.firstName, message: message.trim() });
      if (
        message.endsWith(".png") ||
        message.endsWith(".jpeg") ||
        message.endsWith(".bmp") ||
        message.endsWith(".jpg")
      ) {
        room.messages.push({ user: " ", message: "\n \n \n \n" });
      }
      room.viewed.forEach((view) => (view.isViewed = false));
      console.log("userId", user._id);
      room.viewed.find((view) => {
        console.log("viewId", view._id);
        return view._id.toString() === user._id.toString();
      }).isViewed = true;

      await room.save();

      // let groups = await Groups.find();
      // groups = groups.filter((g) => g._id.toString() !== roomId.toString());
      // groups.unshift(room);
      console.log("before change");
      io.emit("change", { group: room });
      // io.emit("changePosition", { groups: groups });
      io.to(roomId).emit("message", {
        messages: room.messages[room.messages.length - 1],
      });
      callback();
    }
  });

  socket.on("disconnect", () => {
    console.log("User had left!");
  });
});
// server.listen(5000, (err) => {
//   if (err) {
//     console.log(err);
//   } else console.log(`server is listening on 5000`);
// });
