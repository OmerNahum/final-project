/* eslint-disable no-unused-vars */
<template>
  <v-app class="add mx">
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display font-weight-light info--text">New Group</h1>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="GroupName" label="Group Name *" />
          <v-text-field
            readonly
            disabled
            v-model="this.participants"
            label="Participants"
          ></v-text-field>

          <!-- <v-data-table
            :items="this.Participants"
            class="elevation-1"
            :headers="headers"
          >
            <template #item.email="{item}">
              {{ item.email }}
            </template>
          </v-data-table> -->
          <v-file-input
            v-model="image"
            :rules="groupImage"
            @change="onChange"
            accept="image/png, image/jpeg, image/bmp"
            placeholder="Pick group picture"
            prepend-icon="mdi-folder"
            label="Avatar"
          ></v-file-input>
          <DatePicker @clicked="onChangeChild" />

          <v-card-text v-if="!valid" class="error--text"
            >Group name must be given</v-card-text
          >
          <v-card-text v-if="!timeValid" class="error--text"
            >Invalid closing time, closing time will set to 24 hours from
            now.</v-card-text
          >
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" :loading="createLoad" @click="addGroup"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import DatePicker from "./DatePicker";
import moment from "moment";
import io from "socket.io-client";
//const axios = require("axios");

export default {
  name: "Add",
  created() {
    this.socket = io("http://localhost:3000");
    this.setParticipants();
    this.createLoad = false;
  },
  components: { DatePicker },
  computed: {
    ...mapGetters(["Participants", "Valid"]),
  },
  data: () => ({
    date: "",
    groupImage: [
      (value) =>
        !value ||
        value.size < 2000000 ||
        "Avatar size should be less than 2 MB!",
    ],
    image: null,
    imageUrl: null,
    GroupName: "",
    lastName: "",
    participants: [],
    openTime: Date,
    closingTime: null,
    valid: true,
    valid2: false,
    valid3: false,
    valid4: false,
    headers: [{ text: "participants", value: "email" }],
    file: null,
    createLoad: false,
    timeValid: true,
  }),
  methods: {
    async addGroup() {
      this.createLoad = true;
      if (this.GroupName != "") {
        const participants = this.Participants;
        var data = {
          name: this.GroupName,
          image: this.imageUrl
            ? this.imageUrl
            : "https://cdn4.iconfinder.com/data/icons/avatar-1-2/100/Avatar-16-512.png",
          participants: participants ? participants : [],
          closingTime:
            this.closingTime != null && this.closingTime > moment()
              ? this.closingTime
              : moment()
                  .add(1, "days")
                  .format("LLLL"),
        };
        this.updateContacts(null);
        try {
          if (this.file) {
            const reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onloadend = async () => {
              data.image = await this.uploadImage2(reader.result);

              await this.createGroup(data);
              this.socket.emit("onGroupDelete");
              this.$router.push("Show");
            };
            reader.onerror = () => {
              console.error("AHHHHHHHH!!");
            };
            // this.uploadImage(formData);
          } else {
            await this.createGroup(data);
            this.socket.emit("onGroupDelete");
            this.$router.push("Show");
          }
        } catch (err) {
          console.log(err);
          this.createLoad = false;
        }
      } else {
        this.valid = false;
        this.createLoad = false;
      }
    },
    restart() {
      this.GroupName = "";
      this.participants = "";
      this.valid4 = true;
    },
    goto() {
      location.replace("/contacts");
    },
    ...mapActions(["createGroup", "updateContacts", "uploadImage2"]),
    onChangeChild(value) {
      this.timeValid = true;
      this.closingTime = moment(value)
        .add(14, "hours")
        .format("MMMM Do YYYY, h:mm:ss");

      if (moment(value) < moment()) {
        this.timeValid = false;
        this.closingTime = moment()
          .add(1, "days")
          .format("MMMM Do YYYY, h:mm:ss");
      }
    },
    setParticipants() {
      const emails = this.Participants.map((p) => " " + p.email);
      this.participants = emails.toString();
    },
    onChange(e) {
      this.imageUrl = e.name;
      this.file = e;
    },
  },
};
</script>
