/* eslint-disable no-unused-vars */
const sql = require("mssql/msnodesqlv8");
//put on comment from here
const pool = new sql.ConnectionPool({
  server: "localhost",
  database: "metropolint",
  options: {
    trustedConnection: true,
  },
}); // to here

exports.login = (req, res, next) => {

  let password = req.query.password;
  let email = req.query.userName;
  pool
    .connect()
    .then((pool) => {
      return pool
        .request()
        .query(
          `select users.passwordd from users where passwordd ='${password}' and username ='${email}'`
        );
    })
    .then((result) => {
      if (result.recordset.pop().passwordd == password) {
        res.status(200).send({ message: "Confirmed" });
      } else {
        res.status(404).send({ message: "Wrong" });
      }
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({ message: `Error` });
      sql.close();
    });
};
exports.getAllUsers = (req, res, next) => {
  pool
    .connect()
    .then((pool) => {
      return pool
        .request()
        .query(
          "select users.firstname, users.lastname,users.username,users.img from users"
        );
    })
    .then((result) => {
      let rows = result.recordset;
      res.status(200).json(rows);
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({ message: `${err}` });
      sql.close();
    });
};
exports.getAllGroups = (req, res, next) => {
  pool
    .connect()
    .then((pool) => {
      return pool.request().query("select * from groups");
    })
    .then((result) => {
      let rows = result.recordset;
      res.status(200).json(rows);
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({ message: `${err}` });
      sql.close();
    });
};
exports.addGroup = (req, res, next) => {
  var firstName = req.query.firstName;
  var lastName = req.query.lastName;
  var img = req.query.img;
  //var password = req.query.password;

  pool
    .connect()
    .then((pool) => {
      return pool.request().query(
        //`insert into users(firstname,lastname,img) values('${firstName}','${lastName}','${img}')`
        `insert into groups(groupName,participants,img)
          values ('${firstName}','${lastName}','${img}')`
      );
    })
    .then(() => {
      sql.close();
      res.status(200).send({ message: "added user" });
    })
    .catch((err) => {
      res.status(403).send("failed");
      sql.close();
    });
};
exports.deleteUser = (req, res, next) => {
  var username = req.query.username;
  var password = req.query.password;

  pool
    .connect()
    .then((pool) => {
      return pool
        .request()
        .query(
          `select * from users where username= '${username}' AND passwordd='${password}'`
        );
    })
    .then((result) => {
      if (result.recordset.length <= 0)
        res.status(403).json({ error: "Username or password inncorrect" });
      return pool
        .request()
        .query(
          `delete from users where (username ='${username}' and passwordd='${password}')`
        );
    })
    .catch((err) => {
      res.status(403).send("failed");
      sql.close();
    });
};
exports.editUser = (req, res, next) => {
  var firstName = req.query.firstName;
  var lastName = req.query.lastName;
  var username = req.query.userName;
  var password = req.query.password;
  var oldPassword = req.query.oldPassword;
  var oldUsername = req.query.oldUserName;

  pool
    .connect()
    .then((pool) => {
      return pool
        .request()
        .query(
          `select * from users where username= '${oldUsername}' AND passwordd='${oldPassword}'`
        );
    })
    .then((result) => {
      if (result.recordset.length <= 0)
        res.status(403).json({ error: "Username or password inncorrect" });
      return pool
        .request()
        .query(
          `update users set firstname='${firstName}', lastname='${lastName}', username='${username}',passwordd='${password}' where username='${oldUsername}'`
        );
    })
    .catch((err) => {
      res.status(403).json({ error: "Username or password inncorrect" });
    });
};
exports.getSearchedUsers = (req, res, next) => {
  var username = req.query.userName;

  pool
    .connect()
    .then((pool) => {
      return pool
        .request()
        .query(`select * from users where username='${username}'`);
    })
    .then((result) => {
      let rows = result.recordset;
      res.status(200).json(rows);
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({ message: `${err}` });
      sql.close();
    });
};

exports.getSearchedGroups = (req, res, next) => {
  var group = req.query.groupName;

  pool
    .connect()
    .then((pool) => {
      return pool
        .request()
        .query(`select * from groups where groupName='${group}'`);
    })
    .then((result) => {
      let rows = result.recordset;
      res.status(200).json(rows);
      sql.close();
    })
    .catch((err) => {
      res.status(500).send({ message: `${err}` });
      sql.close();
    });
};
exports.addUser = (req, res, next) => {
  var firstName = req.query.firstName;
  var lastName = req.query.lastName;
  var email = req.query.userName;
  var password = req.query.password;
  var img = req.query.img;
  //var password = req.query.password;

  pool
    .connect()
    .then((pool) => {
      return pool.request().query(
        //`insert into users(firstname,lastname,img) values('${firstName}','${lastName}','${img}')`
        `insert into users (firstname, lastname, username, passwordd, img)
          values ('${firstName}','${lastName}','${email}','${password}','${img}')`
      );
    })
    .then(() => {
      sql.close();
      res.status(200).send({ message: "added user" });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).send("failed");
      sql.close();
    });
};
