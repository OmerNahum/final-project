const express = require("express");
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
router.post("/upload", (req, res) => {
  console.log("hellooopfakslgk");
  const file = req.files.file;

  file.mv(`${__dirname}/../../public/${file.name}`, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send({ message: "could not upload" });
    }
    return res.status(200);
  });
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
