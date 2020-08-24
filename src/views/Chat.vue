/* eslint-disable vue/no-unused-vars */
<template>
  <v-app id="app">
    <v-main>
      <v-container fluid fill-height>
        <v-layout align-center justify-center class="blue lighten-4">
          <v-flex xs12 sm9 md7 class="d-flex justify-space-between">
            <v-card class="elevation-12" color="grey lighten-3" width="100%">
              <v-toolbar class="success lighten-1 " @click="dialog = true">
                <v-dialog v-model="dialog" persistent max-width="600px">
                  <template v-slot:activator="{ on }">
                    <a v-on="on">
                      <v-toolbar-title class="black--text">
                        <div class="d-flex">
                          <div>
                            Chat-group: {{ group && group.name }}
                            <v-icon>mdi-information-outline</v-icon>
                          </div>
                        </div>
                      </v-toolbar-title>
                    </a>
                  </template>
                  <v-card>
                    <v-card-title>
                      <span class="headline">Group</span>
                    </v-card-title>
                    <v-card-text>
                      <v-text-field
                        v-model="group.name"
                        label="Group name"
                        :disabled="
                          !(group.admin.toString() === user._id.toString())
                        "
                      ></v-text-field>
                    </v-card-text>
                    <v-card-text>
                      <v-text-field
                        v-model="group.closingTime"
                        label="Closing time"
                        disabled
                      ></v-text-field>
                    </v-card-text>
                    <v-file-input
                      :disabled="
                        !(group.admin.toString() === user._id.toString())
                      "
                      v-model="gpImage"
                      :rules="groupImage"
                      @change="onChange"
                      accept="image/png, image/jpeg, image/bmp"
                      placeholder="Pick group picture"
                      prepend-icon="mdi-folder"
                      label="Change group picture"
                    ></v-file-input>

                    <span v-if="group.admin.toString() === user._id.toString()">
                      <DatePicker @clicked="onChangeChild" />
                    </span>
                    <v-card-text v-if="!valid" class="error--text"
                      >Only admin can change these</v-card-text
                    >
                    <v-card-text v-if="!timeValid" class="error--text"
                      >Invalid closing time, closing time will remain the
                      same.</v-card-text
                    >
                    <v-card-actions>
                      <v-btn color="blue darken-1" text @click="onDialogClose"
                        >Close</v-btn
                      >
                      <v-btn
                        v-if="group.admin.toString() === user._id.toString()"
                        color="blue darken-1"
                        text
                        @click="onSave"
                        >Save</v-btn
                      >
                    </v-card-actions>
                  </v-card>
                </v-dialog>
              </v-toolbar>
              <v-card-text>
                <v-list
                  class="overflow-y-auto"
                  ref="chat"
                  id="logs"
                  height="300"
                  max-height="300"
                >
                  <template v-for="(item, index) in messages">
                    <v-subheader v-if="item.startsWith(' ')" :key="index">
                    </v-subheader>
                    <v-subheader
                      v-if="
                        item &&
                          (item.endsWith('.png') ||
                            item.endsWith('.jpeg') ||
                            item.endsWith('.bmp') ||
                            item.endsWith('.jpg'))
                      "
                      :key="index"
                    >
                      {{ item.split(" ")[0] }}
                      <a
                        :href="item.substr(item.indexOf(' ') + 1)"
                        target="_blank"
                      >
                        <v-img
                          :src="item.substr(item.indexOf(' ') + 1)"
                          max-height="100"
                          max-width="100"
                        />
                      </a>
                    </v-subheader>
                    <v-subheader
                      v-if="
                        item &&
                          !item.startsWith(' ') &&
                          !(
                            item.endsWith('.png') ||
                            item.endsWith('.jpeg') ||
                            item.endsWith('.bmp') ||
                            item.endsWith('.jpg')
                          )
                      "
                      :key="index"
                    >
                      {{ item }}
                    </v-subheader>
                  </template>
                </v-list>
              </v-card-text>
              <v-form @submit.prevent="submit" class="d-flex">
                <v-textarea
                  background-color="white"
                  color="black"
                  auto-grow
                  v-model="message"
                  label="Message"
                  solo-inverted
                  rows="1"
                  spellcheck
                  @keydown.enter="sendMessage"
                ></v-textarea>
                <form class="ml-3">
                  <v-btn
                    :loading="sendLoad"
                    @click="sendMessage"
                    fab
                    small
                    color="success"
                  >
                    Send</v-btn
                  >
                  <v-dialog v-model="regDialog" persistent max-width="600px">
                    <template v-slot:activator="{ on }">
                      <v-btn
                        class="ml-1"
                        :loading="imageLoad"
                        color="red lighten-3"
                        x-small
                        depressed
                        fab
                        v-on="on"
                      >
                        <v-icon>mdi-image</v-icon>
                      </v-btn>
                    </template>
                    <v-card>
                      <v-card-title>
                        <span class="headline">Send Picture</span>
                      </v-card-title>
                      <v-card-text>
                        <v-file-input
                          v-model="image"
                          :rules="groupImage"
                          @change="onChange"
                          accept="image/png, image/jpeg, image/bmp"
                          placeholder="Pick group picture"
                          prepend-icon="mdi-folder"
                          label="Avatar"
                        ></v-file-input>
                      </v-card-text>
                      <v-card-actions>
                        <v-btn color="blue darken-1" text @click="onDialogClose"
                          >Close</v-btn
                        >
                        <v-spacer></v-spacer>
                        <v-btn
                          color="success darken-1"
                          text
                          @click="onDialogSend"
                          v-if="image"
                          >Send</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </form>
              </v-form>
            </v-card>
            <v-card class="elevation-12" color="grey lighten-3" width="30%">
              <v-toolbar dark class="success lighten-1 ">
                <v-toolbar-title class="black--text"
                  >Participants</v-toolbar-title
                >
              </v-toolbar>
              <v-card-text>
                <v-list class="overflow-y-auto" max-height="300">
                  <template v-for="(item, index) in participants">
                    <v-subheader
                      class="d-flex justify-space-between"
                      v-if="item && item !== user.email"
                      :key="index"
                    >
                      {{ item }}
                      <v-btn
                        x-small
                        :loading="deletePartLoad"
                        text
                        color="red"
                        @click="deletePart(item)"
                      >
                        <v-icon
                          v-if="user._id.toString() == group.admin.toString()"
                        >
                          mdi-delete
                        </v-icon>
                      </v-btn>
                    </v-subheader>
                  </template>
                </v-list>
              </v-card-text>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import io from "socket.io-client";
import DatePicker from "./DatePicker";
import moment from "moment";
// const axios = require("axios");
export default {
  created() {
    this.socket = io("http://localhost:3000");
    this.connectGroup();
    this.imageLoad = false;
    setTimeout(() => {
      this.scrollToEnd();
    }, 1000);
  },
  components: { DatePicker },
  computed: {
    ...mapGetters(["User", "chatGroup", "Logs", "chatPart"]),
  },
  data: () => ({
    groupImage: [
      (value) =>
        !value ||
        value.size < 2000000 ||
        "Avatar size should be less than 2 MB!",
    ],
    imageLoad: false,
    image: null,
    imageUrl: null,
    logs: [],
    msg: null,
    user: null,
    group: null,
    roomId: "",
    socket: null,
    messages: [],
    message: "",
    participants: [],
    dialog: false,
    valid: true,
    regDialog: false,
    file: null,
    gpImage: null,
    sendLoad: false,
    deletePartLoad: false,
    row: false,
    mdiImage: null,
    timeValid: true,
  }),
  methods: {
    async connectGroup() {
      this.user = this.User;
      this.group = this.chatGroup;

      while (!this.group);

      // this.gpImage = this.group.image;
      this.roomId = this.group._id;
      await this.createLogs(this.group._id);
      this.messages = this.Logs;
      await this.setChatPart(this.chatGroup.participants);

      this.participants = this.chatPart.map((user) => user.email);

      this.socket.emit(
        "join",
        { group: this.chatGroup, roomId: this.roomId, _id: this.user._id },
        () => {}
      );
      this.socket.on("change", (group) => {
        if (group.group._id.toString() === this.group._id.toString())
          return (this.group = group.group);
      });
      this.socket.on("message", (messages) => {
        this.socket.emit(
          "view",
          { group: this.chatGroup, roomId: this.roomId, _id: this.user._id },
          () => {}
        );

        if (messages.messages.length > 1) {
          for (let i = 0; i < messages.messages.length; i++) {
            const message =
              messages.messages[i].user != " "
                ? messages.messages[i].user +
                  ": " +
                  messages.messages[i].message
                : messages.messages[i].message;
            this.messages.push(message);
          }
        } else {
          const message =
            messages.messages.user != " "
              ? messages.messages.user + ": " + messages.messages.message
              : messages.messages.message;
          this.messages.push(message);
        }

        setTimeout(() => {
          this.scrollToEnd();
          this.imageLoad = false;
        }, 100);
      });
    },
    scrollToEnd: function() {
      var container = this.$el.querySelector("#logs");
      container.scrollTop = container.scrollHeight;
    },
    async sendMessage(event) {
      this.sendLoad = true;
      event.preventDefault();

      this.message = this.message.trim();

      if (this.message != "") {
        this.socket.emit(
          "sendMessage",
          { user: this.user, roomId: this.group._id, message: this.message },
          () => {
            this.message = "";
            this.sendLoad = false;
          }
        );
      } else {
        this.sendLoad = false;
      }
    },
    onChangeChild(value) {
      this.timeValid = true;
      this.closingTime = moment(value)
        .add(14, "hours")
        .format("MMMM Do YYYY, h:mm:ss");

      if (moment(value) < moment()) {
        this.timeValid = false;
        this.closingTime = this.group.closingTime;
      }
    },
    ...mapActions([
      "createLogs",
      "setChatPart",
      "deleteChatPart",
      "setGroupNameAndClosing",
      "uploadImage2",
    ]),
    submit() {
      this.log = this.messages.map((p) => p.user + ": " + p.message);
    },
    async deletePart(email) {
      this.deletePartLoad = true;
      if (this.user._id == this.group.admin) {
        const data = { email: email, groupId: this.group._id };
        await this.deleteChatPart(data);
        this.participants = this.chatPart.map((part) => part.email);
        this.deletePartLoad = false;
      } else {
        alert("Only admin can delete participants");
        this.deletePartLoad = true;
      }
    },
    onSave() {
      if (this.chatGroup.admin.toString() == this.user._id.toString()) {
        this.dialog = false;
        this.group.image = this.imageUrl ? this.imageUrl : this.group.image;
        try {
          if (this.file) {
            const reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onloadend = async () => {
              this.group.image = await this.uploadImage2(reader.result);
              this.setGroupNameAndClosing(this.group);
              this.socket.emit("onChange", { group: this.group });
            };
            reader.onerror = () => {
              console.error("AHHHHHHHH!!");
            };
          } else {
            this.setGroupNameAndClosing(this.group);
            this.socket.emit("onChange", { group: this.group });
          }
        } catch (err) {
          console.log(err);
          this.createLoad = false;
        }
      } else {
        this.dialog = true;
        this.valid = false;
      }
    },
    onDialogSend() {
      this.imageLoad = true;
      this.regDialog = false;
      let img;
      if (this.image) {
        try {
          if (this.file) {
            const reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onloadend = async () => {
              img = await this.uploadImage2(reader.result);

              this.socket.emit(
                "sendMessage",
                { user: this.user, roomId: this.group._id, message: img },
                () => (this.message = "")
              );
            };
            reader.onerror = () => {
              console.error("AHHHHHHHH!!");
            };
            // this.uploadImage(formData);
          }
        } catch (err) {
          console.log(err);
          this.imageLoad = false;
        }
      }
    },
    onDialogClose() {
      this.regDialog = false;
      this.dialog = false;
      this.image = null;
      this.file = null;
      this.imageUrl = null;
      this.gpImage = null;
    },

    onChange(e) {
      this.imageUrl = e.name;
      this.file = e;
    },

    // ...mapActions(["uploadImage"]),
  },
  beforeDestroy() {
    this.messages = [];
    this.socket.emit("disconnect");
    this.socket.close();
  },
};
</script>
