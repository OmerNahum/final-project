const mongoose = require("../database");
//const users = require("./userModel");
const moment = require("moment");

const msgSchema = new mongoose.Schema({
  user: {
    type: String,
    required: false,
  },
  message: {
    type: String,
    required: true,
  },
  sendTime: {
    type: String,
    default: moment().format("MMMM Do YYYY, h:mm:ss"),
  },
});

const viewedMessage = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "user",
  },
  isViewed: {
    type: Boolean,
    default: true,
  },
});

const schema = {
  name: { type: mongoose.SchemaTypes.String, required: true },
  image: { type: mongoose.SchemaTypes.String, required: false },
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },
  ],
  openTime: {
    type: String,
    default: moment(Date.now()).format("MMMM Do YYYY, h:mm:ss"),
  },
  closingTime: { type: mongoose.SchemaTypes.String, required: false },
  admin: [{ type: mongoose.Schema.ObjectId, ref: "user" }],
  messages: [msgSchema],
  viewed: [viewedMessage],
};
const collectionName = "groups"; // Name of the collection of documents
const groupSchema = mongoose.Schema(schema);
const Group = mongoose.model(collectionName, groupSchema);
module.exports = Group;
