const express = require("express");
//const axios = require("axios");
const { cloudinary } = require("../utils/cloudinary");

require("mongoose");
//const userController = require("../controllers/user");
const userController = require("../controllers/mongoQ");
const router = express.Router();
const passport = require("passport");
//const { route } = require("./chat");

router.post(
  "/login",
  passport.authenticate("local"),
  userController.loginPassport
);
router.post("/addUser", userController.addUser);
router.get("/currentUser", userController.currentUser);
router.post("/createGroup", userController.createGroup);
router.get("/logout", userController.logout);
router.get("/getAllGroups", userController.getAllGroups);
router.get("/getAllUsers", userController.getAllUsers);
router.post("/leaveGroup", userController.leaveGroup);
router.post("/addContact", userController.addContact);
router.post("/adminDeleteGroup", userController.adminDeleteGroup);
router.post("/deleteContact", userController.deleteContact);
router.post("/getGroup", userController.getGroup);
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email", "https://www.google.com/m8/feeds"],
  })
);
router.get(
  "/google/redirect",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    console.log("redirect from server");
    console.log(req.user);
    res.redirect("http://localhost:8080/Show");
  }
);
router.post("/getMessages", userController.getMessages);

router.post("/getChatPart", userController.getChatPart);
router.post("/deleteChatPart", userController.deleteChatPart);
router.post("/setInterests", userController.setInterests);
router.post("/setGroupNameAndClosing", userController.setGroupNameAndClosing);
router.get("/recommendedContacts", userController.recommendedContacts);
router.get("/recommendedGroups", userController.recommendedGroups);
router.post("/upload", async (req, res) => {
  // console.log("req.body", req.body);
  // console.log("req.body", req.files);
  // const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzhfa0ywj";

  // axios({
  //   url: CLOUDINARY_URL,
  //   method: "post",
  //   headers: {
  //     "Content-Type": "application/x-www-form-urlencoded",
  //   },
  //   data: { upload_preset: req.body.upload_preset, file: req.files.file },
  // })
  //   .then((result) => {
  //     console.log(result.data.secure_url);
  //     res.status(200).send(result.data.secure_url);

  //   })
  //   .catch((error) => {
  //     console.log("files error", error.message);
  //   });

  try {
    const fileStr = req.body.data;
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      upload_preset: "y1g5txmx",
    });
    // console.log("uploadResponse", uploadResponse);
    res.send(uploadResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ err: "Something went wrong" });
  }
});
router.post("/changeProfile", userController.changeProfile);
router.post("/setLastSeen", userController.setLastSeen);
// router.post("/addGroup", userController.addGroup);
// router.post("/deleteUser", userController.deleteUser);
// router.post("/editUser", userController.editUser);
// router.get("/getSearchedUsers", userController.getSearchedUsers);
// router.get("/login", userController.login);

// router.post("/addUser", userController.addUser);

module.exports = router;
