/* eslint-disable no-unused-vars */
<template>
  <v-app class="Profile">
    <v-layout align-center justify-center class="blue lighten-4">
      <v-card
        :width="cardWidth"
        class="mx-auto mt-5"
        v-resize="onResize"
        fill-height
      >
        <form>
          <v-card-title>
            <h1 class="display font-weight-light info--text">Profile</h1>
          </v-card-title>

          <v-card-text>
            <v-form>
              <v-input disabled
                ><v-avatar><img :src="user.image"/></v-avatar>
                {{ this.firstName }}</v-input
              >
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
                label="Change Avatar"
              ></v-file-input>

              <v-text-field
                required
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                label="New Password (not required)"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
              />
              <v-text-field
                required
                v-model="confirmPassword"
                :type="showPassword ? 'text' : 'password'"
                label="Confirm New Password"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
              />
              <!-- <v-dialog v-model="RegDialog" persistent max-width="600px">
            <template v-slot:activator="{ on }">
              <v-btn color="info" dark v-on="on" @click="setDialog"
                >Set Interests</v-btn
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
                <v-btn color="blue darken-1" text @click="dialog = false"
                  >Close</v-btn
                >
              </v-card-actions>
            </v-card>
          </v-dialog> -->
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
            <v-container>
              <v-row dense>
                <v-btn color="success" @click="passwordCheck(password)"
                  >Save</v-btn
                >
                <v-spacer></v-spacer>
                <v-btn color="red white--text" to="/Show"> Cancel</v-btn>
              </v-row>
            </v-container>
          </v-card-actions>
        </form>
      </v-card>
    </v-layout>
  </v-app>
</template>

<script>
// @ is an alias to /src
//import App from '../App';
//var $ = require("jquery");
// import Interests from "./Interests";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "Profile",
  components: {},
  created() {
    this.setUser();
  },
  computed: {
    ...mapGetters(["Interests", "RegDialog", "User"]),
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
    errorMessage: null,
    imageUrl: null,
    dialog: false,
    file: null,
    user: null,
    cardWidth: window.outerWidth * 0.33,
    cardHeight: window.outerHeight * 0.25,
  }),
  methods: {
    setUser() {
      this.user = this.User;
      while (!this.user);
      this.firstName = this.user.firstName;
      this.lastName = this.user.lastName;
      this.email = this.user.email;
    },
    async setNewProfile() {
      this.valid2 = false;
      if (
        this.firstName != "" &&
        this.email != "" &&
        this.password == this.confirmPassword
      ) {
        const data = {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          password: this.password != "" ? this.password : this.user.password,
          image: this.imageUrl ? this.imageUrl : this.user.image,
          interests: this.Interests ? this.Interests : this.user.interests,
        };
        if (this.file) {
          const formData = new FormData();
          formData.append("file", this.file);
          this.uploadImage(formData);
        }

        await this.changeProfile(data);
        this.errorMessage = this.Valid;

        if (!this.errorMessage) {
          this.$router.push("/Show");
        }
      } else this.valid = false;
    },
    passwordCheck() {
      this.valid3 = false;
      this.valid = true;

      if (this.password !== this.confirmPassword) return;

      if (this.password == "" || this.password.length >= 4) {
        this.setNewProfile();
      } else {
        this.valid3 = true;
      }
    },
    setDialog() {
      this.setRegDialog(true);
    },
    ...mapActions(["setRegDialog", "uploadImage", "changeProfile"]),
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
      this.cardHeight = window.outerHeight * 0.25;
    },
  },
};
</script>
