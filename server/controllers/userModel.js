const mongoose = require("../database");
//const groupsModel = require("./groupModel");
const moment = require("moment");

const schema = {
  firstName: { type: mongoose.SchemaTypes.String, required: true },
  lastName: { type: mongoose.SchemaTypes.String },
  email: { type: mongoose.SchemaTypes.String, required: true, unique: true },
  password: {
    type: mongoose.SchemaTypes.String,
  },
  contacts: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
  image: { type: mongoose.SchemaTypes.String, required: false },
  groups: [{ type: mongoose.Schema.ObjectId, ref: "groups" }],
  interests: [{}],
  lastSeen: {
    type: String,
    default: moment(Date.now()).format("MMMM Do YYYY, h:mm:ss"),
  },
};
// Name of the collection of documents
const collectionName = "user";
const userSchema = mongoose.Schema(schema);
const User = mongoose.model(collectionName, userSchema);

module.exports = User;
