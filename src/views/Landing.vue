/* eslint-disable no-unused-vars */
<template>
  <v-app class="login">
    <v-layout align-center justify-center class="blue lighten-4">
      <v-card
        :width="cardWidth"
        class="mx-auto mt-5"
        fill-height
        v-resize="onResize"
      >
        <v-card-title>
          <h1 class="display font-weight-light info--text">Login</h1>
        </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field
              v-model="email"
              @keydown.enter="login(password)"
              label="Email"
              :rules="emailRules"
              placeholder="email@email.com"
            />
            <v-text-field
              v-model="password"
              @keydown.enter="login(password)"
              :type="showPassword ? 'text' : 'password'"
              label="Password"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPassword = !showPassword"
            />
            <v-card-text v-if="!valid" class="error--text"
              >Password or Username incorrect</v-card-text
            >
            <v-card-text v-if="valid3" class="error--text"
              >Wrong password
            </v-card-text>
          </v-form>
        </v-card-text>

        <v-card-actions dense>
          <v-container>
            <v-row dense>
              <v-btn small color="info" @click="login(password)">Login</v-btn>
              <v-btn
                small
                class="ml-1"
                color="success"
                router-link
                to="/Register"
                >Register</v-btn
              >
              <v-spacer></v-spacer>

              <a small href="http://localhost:3000/user/google">
                <v-icon>
                  mdi-google
                </v-icon>
              </a>
            </v-row>
          </v-container>
        </v-card-actions>
      </v-card>
    </v-layout>
  </v-app>
</template>

<script>
// @ is an alias to /src

//var $ = require("jquery");
//import Show from "./Show";
//var axios = require("axios");
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  name: "Login",
  components: {},
  computed: {
    ...mapGetters(["User"]),
  },
  data: () => ({
    emailRules: [
      (v) => !!v || "E-mail is required",
      (v) => /.+@.+/.test(v) || "E-mail must be valid",
    ],
    showPassword: false,
    email: "",
    password: "",
    valid: true,
    valid2: false,
    valid3: false,
    valid4: false,
    types: [],
    cardWidth: window.outerWidth * 0.33,
  }),
  methods: {
    async login() {
      this.valid2 = false;
      this.valid = true;
      //var self = this;
      var data = {
        email: this.email,
        password: this.password,
      };

      await this.setUser(data);

      this.user = this.User;

      if (!this.user) {
        this.valid = false;
      } else {
        this.$router.push("Show");
      }
    },
    async googleLogin() {
      await this.currentUser();
      this.user = this.User;
      if (!this.user) {
        this.valid = false;
      } else {
        this.$router.push("Show");
      }
    },
    onResize() {
      this.cardWidth = window.outerWidth * 0.33;
    },
    ...mapActions(["setUser", "setUserBygoogle", "currentUser"]),
  },
};
</script>
