/* eslint-disable no-unused-vars */
<template>
  <v-app class="Register">
    <v-layout align-center justify-center class="blue lighten-4">
      <v-card
        :width="cardWidth"
        fill-height
        class="mx-auto mt-5"
        v-resize="onResize"
      >
        <v-card-title>
          <h1 class="display font-weight-light info--text">Register</h1>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="firstName" label="First Name *" required />
            <v-text-field v-model="lastName" label="Last Name" />
            <v-text-field
              v-model="email"
              label="Email *"
              :rules="emailRules"
              placeholder="email@email.com"
              required
            />
            <v-file-input
              v-model="image"
              :rules="groupImage"
              @change="onChange"
              accept="image/png, image/jpeg, image/bmp"
              placeholder="Pick group picture"
              prepend-icon="mdi-folder"
              label="Avatar"
            ></v-file-input>

            <v-text-field
              required
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              label="Password *"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
            />
            <v-text-field
              required
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              label="Confirm Password *"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
            />
            <v-dialog v-model="RegDialog" persistent max-width="600px">
              <template v-slot:activator="{ on }">
                <v-btn color="info" dark v-on="on" @click="setDialog"
                  >Add Interests</v-btn
                >
              </template>
              <v-card>
                <v-card-title>
                  <span class="headline">Interests</span>
                </v-card-title>
                <v-card-text>
                  <v-container>
                    <Interests></Interests>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-btn color="blue darken-1" text @click="setRegDialog(false)"
                    >Close</v-btn
                  >
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-card-text v-if="password != confirmPassword" class="red--text"
              >Password don't match</v-card-text
            >
            <v-card-text v-if="!valid" class="error--text"
              >You must fill all * fields</v-card-text
            >
            <v-card-text v-if="valid2" class="error--text"
              >Email already exist</v-card-text
            >
            <v-card-text v-if="valid3" class="error--text"
              >Password must have 4 or more characters
            </v-card-text>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="success" @click="passwordCheck(password)"
            >Register</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn color="red white--text" to="/"> Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-app>
</template>

<script>
// @ is an alias to /src
//import App from '../App';
//var $ = require("jquery");
var axios = require("axios");
import Interests from "./Interests";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Add",
  components: { Interests },
  created() {},
  computed: {
    ...mapGetters(["Interests", "RegDialog"]),
  },
  data: () => ({
    groupImage: [
      (value) =>
        !value ||
        value.size < 2000000 ||
        "Avatar size should be less than 2 MB!",
    ],
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
    ],
    showPassword: false,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: null,
    valid: true,
    valid2: false,
    valid3: false,
    valid4: false,
    imageUrl: null,
    dialog: false,
    file: null,
    cardWidth: window.outerWidth * 0.33,
  }),
  methods: {
    addUser() {
      this.valid2 = false;
      if (
        this.firstName != "" &&
        this.email != "" &&
        this.password != "" &&
        this.password == this.confirmPassword
      ) {
        const data = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password,
          image: this.imageUrl
            ? this.imageUrl
            : "https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQqxFDpAr9FpHYSNvxKAGp65w5QQ6nKkBPFUuzJGGuduwtL3F86&usqp=CAU",
          interests: this.Interests
            ? this.Interests
            : new Array(Interests.data().interests.length).fill(0),
        };
        if (this.file) {
          const formData = new FormData();
          formData.append("file", this.file);
          this.uploadImage(formData);
        }

        var url = `/user/addUser`;

        axios
          .post(url, data)
          .then(() => {
            setTimeout(() => {}, 200);
            this.$router.push("/");
          })
          .catch((err) => {
            console.log(err);
            this.valid2 = true;
          });
      } else this.valid = false;
    },

    passwordCheck() {
      this.valid3 = false;
      this.valid = true;

      if (this.password.length >= 4) {
        this.addUser();
      } else {
        this.valid3 = true;
      }
    },
    setDialog() {
      this.setRegDialog(true);
    },
    ...mapActions(["setRegDialog", "uploadImage"]),
    restart() {
      this.password = "";
      this.firstName = "";
      this.lastName = "";
      this.userName = "";
      this.confirmPassword = "";
    },
    onChange(e) {
      this.imageUrl = e.name;
      this.file = e;
    },
    onResize() {
      this.cardWidth = window.outerWidth * 0.33;
    },
  },
};
</script>
