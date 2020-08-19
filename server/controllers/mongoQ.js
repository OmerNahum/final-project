/* eslint-disable no-unused-vars */
const passport = require("passport");
const Users = require("./userModel");
const bcrypt = require("bcrypt");
const Group = require("./groupModel");
const moment = require("moment");
//const kmeans = require("ml-kmeans");
const clustering = require("density-clustering");
//const { forEach } = require("core-js/fn/array");
const functions = require("../utils/dbs");
const mongoose = require("../database");

exports.loginPassport = (req, res) => {
  res.status(200).send(req.user);
};

exports.googleLoginRedirect = (req, res) => {
  passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("http://localhost:8080/Show");
    };
};

exports.addUser = function(req, res) {
  Users.findOne({ email: req.body.email })
    .then(async (user) => {
      if (user != null) res.status(500).send({ message: "exists" });
      //Users.create(req.allParams());
      var hashedPassword = await bcrypt.hash(req.body.password, 10);
      var body = {
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        email: req.body.email.trim(),
        password: hashedPassword,
        image: req.body.image,
        interests: req.body.interests,
      };
      return new Users(body).save();
    })
    .then(() => {
      return res.status(200).send("success");
    })
    .catch((err) => {
      res.status(500).send({ message: "error" });
    });
};

exports.currentUser = (req, res) => {
  res.status(200).send(req.user);
};

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/");
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/Show");
  }
  next();
}

// exports.getAllGroups = (req, res) => {
//   Users.findOne({ email: req.user.email })
//     .then((result) => {
//       res.status(200).send(result.groups);
//     })
//     .catch((err) => {
//       res.status(500).send({ message: "--------------" + err });
//     });
// };

exports.createGroup = async (req, res) => {
  const usersId = req.body.groupData.participants.map((p) => p._id);
  const viewList = req.body.groupData.participants.map((p) => ({
    _id: p._id,
  }));

  const data = {
    name: req.body.groupData.name,
    image: req.body.groupData.image,
    participants: [req.user.id, ...usersId],
    openTime: moment().format("MMMM Do YYYY, h:mm:ss"),
    viewed: [{ _id: req.user.id }, ...viewList],
    closingTime: req.body.groupData.closingTime,
    admin: [req.user.id],
  };
  const group = await new Group(data).save();
  const users = await Users.find({ _id: { $in: group.participants } });
  users.forEach(async (user) => {
    await Users.findOneAndUpdate(
      { email: user.email },
      { groups: [...user.groups, group._id] },
      {
        new: true,
      }
    );
  });
  res.status(200).send(req.user);
};

exports.logout = (req, res) => {
  req.logout();
  res.redirect("https://tranquil-lowlands-83761.herokuapp.com/");
};

exports.getAllGroups = async (req, res) => {
  const id = req.user.groups;
  const groups = await Group.find({ _id: { $in: id } });
  const filteredGroups = groups.filter(
    (group) => moment(group.closingTime).diff(moment(Date.now())) >= 0
  );

  filteredGroups.sort((g1, g2) => {
    if (g1.messages.length > 0 && g2.messages.length > 0) {
      return g1.messages.slice(g1.messages.length - 1)[0].sendTime <
        g2.messages.slice(g2.messages.length - 1)[0].sendTime
        ? 1
        : -1;
    } else if (g1.messages.length > 0) {
      return g1.messages.slice(g1.messages.length - 1)[0].sendTime < g2.openTime
        ? 1
        : -1;
    } else if (g2.messages.length > 0) {
      return g1.openTime < g2.messages.slice(g1.messages.length - 1)[0].sendTime
        ? 1
        : -1;
    } else {
      return g1.openTime < g2.openTime ? 1 : -1;
    }
  });

  res.status(200).send(filteredGroups);
};

exports.leaveGroup = async (req, res) => {
  const groups = req.user.groups.filter((id) => id != req.body.payload);

  let group = await Group.findById(req.body.payload);

  group.participants = group.participants.filter(
    (part) => part.toString() !== req.user._id.toString()
  );

  group.viewed = group.viewed.filter(
    (part) => part._id.toString() !== req.user._id.toString()
  );

  await group.save();

  Users.findOneAndUpdate(
    { email: req.user.email },
    { groups: groups },
    {
      new: true,
    }
  )
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send({ message: err });
    });
};

exports.adminDeleteGroup = async (req, res) => {
  const group = await Group.findById(req.body.groupId);
  const part = group.participants;
  const users = await Users.find({ _id: { $in: part } });
  const upGroups = req.user.groups.filter(
    (group) => group.toString() != req.body.groupId.toString()
  );

  users.forEach(async (user) => {
    const groups = user.groups.filter(
      (group) => group._id.toString() != req.body.groupId.toString()
    );
    user.groups = groups;
    await user.save();
    // await Users.findOneAndUpdate(
    //   { email: user.email },
    //   { groups: groups },
    //   { new: true }
    // );
  });
  await Group.findByIdAndDelete(req.body.groupId);
  const sGroups = await Group.find({ _id: { $in: upGroups } });

  const filteredGroups = sGroups.filter(
    (group) => moment(group.closingTime).diff(moment(Date.now())) >= 0
  );
  await Group.findByIdAndRemove(req.body.groupId);

  res.status(200).send(filteredGroups);
};

exports.recommendedContacts = async (req, res) => {
  let allUsers = await Users.find();
  allUsers = allUsers.filter(
    (user) => !req.user.contacts.includes(user._id.toString())
  );
  const userIndex = allUsers.findIndex(
    (user) => user._id.toString() == req.user._id.toString()
  );
  const dbscan = new clustering.DBSCAN();
  const clusters = dbscan.run(allUsers, 2, 4, functions.euclideanDist);

  let matchCluster = clusters.find((cluster) => cluster.includes(userIndex));
  if (matchCluster) {
    matchCluster = matchCluster.filter((index) => index !== userIndex);
  } else {
    let i = 3;
    while (!matchCluster) {
      const clusters = dbscan.run(allUsers, i, 4, functions.euclideanDist);

      matchCluster = clusters.find((cluster) => cluster.includes(userIndex));
      i++;
    }
  }

  const clusterUsers = matchCluster.map((i) => allUsers[i]);

  clusterUsers.sort((user1, user2) => {
    return functions.func(user1.interests, req.user.interests) >=
      functions.func(user2.interests, req.user.interests)
      ? 1
      : -1;
  });

  return res
    .status(200)
    .send(clusterUsers.slice(Math.max(clusterUsers.length - 10, 0)));
};

exports.recommendedGroups = async (req, res) => {
  let users = await Users.find({ _id: { $in: req.user.contacts } });
  const groupsId = req.user.groups.slice(
    Math.max(req.user.groups.length - 30, 0)
  );
  users.push(req.user);
  let lastGroups = [];
  if (groupsId.length > 0) {
    lastGroups = await Group.find({ _id: { $in: groupsId } });
  }

  const userIndex = users.length - 1;

  const dbscan = new clustering.DBSCAN();
  try {
    const clusters = dbscan.run(users, 3, 2, functions.euclideanDist);

    let matchCluster = await clusters.find((cluster) =>
      cluster.includes(userIndex)
    );

    if (!matchCluster) {
      let fillers = [];
      for (let i = 0; i < 6; i++) {
        fillers.push(users[Math.floor(Math.random() * users.length)]);
      }
      const divide1 =
        lastGroups.length > 0 ? (35 - lastGroups.length) / 100 : 1;
      const divide2 = 1 - divide1;
      matchCluster = fillers;
      fillers.sort((user1, user2) =>
        functions.funcG(user1._id.toString(), lastGroups) * divide2 -
          functions.func(req.user.interests, user1.interests) * divide1 >=
        functions.funcG(user2._id.toString(), lastGroups) * divide2 -
          functions.func(req.user.interests, user2.interests) * divide1
          ? 1
          : -1
      );
      return res.status(200).send(fillers);
    }

    let clusterUsers = matchCluster.map((i) => users[i]);

    const divide1 = lastGroups.length > 0 ? (35 - lastGroups.length) / 100 : 1;
    const divide2 = 1 - divide1;
    clusterUsers = clusterUsers.filter(
      (user) => user._id.toString() != req.user._id.toString()
    );

    if (clusterUsers) {
      clusterUsers.sort((user1, user2) =>
        functions.funcG(user1._id.toString(), lastGroups) * divide2 -
          functions.func(req.user.interests, user1.interests) * divide1 >=
        functions.funcG(user2._id.toString(), lastGroups) * divide2 -
          functions.func(req.user.interests, user2.interests) * divide1
          ? 1
          : -1
      );
    }

    return res
      .status(200)
      .send(clusterUsers.slice(Math.max(clusterUsers.length - 10, 0)));
  } catch (error) {
    return res.status(404).send("cant find recommended");
  }
};

exports.getAllUsers = async (req, res) => {
  const id = req.user.contacts;
  const users = await Users.find({ _id: { $in: id } });

  // if (users) {
  //   users.sort((user, user2) =>
  //     func(req.user.interests, user.interests) * divide1 +
  //       funcG(user._id.toString()) * divide2 <=
  //     func(req.user.interests, user2.interests) * divide1 +
  //       funcG(user2._id.toString()) * divide2
  //       ? 1
  //       : -1
  //   );
  // }

  res.status(200).send(users);
};

exports.addContact = async (req, res) => {
  let user = null;
  let id =
    typeof req.body.payload == "string"
      ? [req.body.payload]
      : req.body.payload.map((p) => p._id);

  if (id.length == 1) {
    if (typeof req.body.payload == "string") {
      user = await Users.findOne({ email: id[0] });
    } else {
      user = await Users.findOne({ _id: id[0] });
    }
  }

  if (id.length != 1 || user) {
    if (id.length == 1) {
      if (req.user.contacts.includes(user._id)) {
        res.status(500).send({ message: "already exist" });
      }

      id = [user._id];
    }
    Users.findOneAndUpdate(
      { email: req.user.email },
      {
        contacts: [...req.user.contacts, ...id],
      },
      {
        new: true,
      }
    )
      .then(async (result) => {
        const users = await Users.find({ _id: { $in: result.contacts } });
        return res.status(200).send(users);
      })
      .catch((err) => {
        res.status(500).send(err);
      });
  } else res.status(500).send({ message: "Unregistered user" });
};

exports.deleteContact = async (req, res) => {
  const cont = req.user.contacts.filter(
    (contact) => contact._id != req.body.contactId
  );
  await Users.findByIdAndUpdate(
    { _id: req.user._id },
    { contacts: cont },
    { new: true }
  )
    .then(res.status(200).send(req.user))
    .catch((err) => {
      res.status(500).send("delete contact err");
    });
};

exports.getGroup = (req, res) => {
  Group.findById(req.body.groupId).then((result) => {
    res.status(200).send(result);
  });
};

exports.getMessages = async (req, res) => {
  const group = await Group.findById(req.body.groupId);

  if (group) {
    const messages = group.messages.map((p) => p.user + ": " + p.message);

    res.status(200).send(group.messages.map((p) => p.user + ": " + p.message));
  }
};

exports.getChatPart = (req, res) => {
  Users.find({ _id: { $in: req.body.partId } })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(404).send({ message: "can't find users" });
    });
};
exports.deleteChatPart = async (req, res) => {
  const group = await Group.findById(req.body.groupId);
  let user = await Users.findOne({ email: req.body.email });
  user.groups = user.groups.filter(
    (group) => group.toString() !== req.body.groupId
  );
  await user.save();

  let participants = group.participants.filter(
    (part) => user.id.toString() !== part.toString()
  );

  group.participants = participants;
  await group.save();
  participants = await Users.find({ _id: { $in: participants } });
  if (participants) {
    res.status(200).send({ participants, group });
  } else res.status(500).send({ message: "error in delete participants" });
};

exports.setInterests = (req, res) => {
  Users.findByIdAndUpdate(
    req.user._id,
    { interests: req.body.data },
    { new: true }
  )
    .then(() => {
      res.status(200);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
};
exports.setGroupNameAndClosing = async (req, res) => {
  let group = await Group.findById(req.body.group._id);
  if (group) {
    group.name = req.body.group.name;
    group._id = req.body.group._id;
    group.image = req.body.group.image;
    group.participants = req.body.group.participants;
    group.messages = req.body.group.messages;
    group.openTime = req.body.group.openTime;
    group.closingTime = req.body.group.closingTime;
    group.admin = req.body.group.admin;

    await group.save();
    res.status(200).send(group);
  } else {
    res.status(500).send("error");
  }
  // await Group.findByIdAndUpdate(
  //   req.body.group._id,
  //   {
  //     name: req.body.group.name,
  //     closingTime: req.body.group.closingTime,
  //     image: req.body.group.image,
  //   },
  //   { new: true }
  // )
  //   .then((group) => {
  //     res.status(200).send(group);
  //   })
  //   .catch((err) => {
  //     res.status(500).send("error");
  //   });
};

exports.changeProfile = async (req, res) => {
  let hashedPassword = req.body.password;
  if (hashedPassword !== req.user.password) {
    hashedPassword = await bcrypt.hash(req.body.password, 10);
  }

  Users.findOneAndUpdate(
    { email: req.user.email },
    {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      image: req.body.image,
      interests: req.body.interests,
    },
    { new: true }
  )
    .then(() => {
      return res.status(200).send(req.user);
    })
    .catch((err) => {
      return res.status(500).send({ message: "Profile change faild" });
    });
  //  Users.findOneAndUpdate({email: req.user.email},{firstName: req.profile})
};
exports.setLastSeen = async (req, res) => {
  await Users.findByIdAndUpdate(
    req.user._id,
    { lastSeen: moment().format("MMMM Do YYYY, h:mm:ss") },
    { new: true }
  )
    .then((result) => {
      res.status(200).send(result);
    })
    .catch(() => {
      res.status(500);
    });
};
