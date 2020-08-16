/* eslint-disable no-unused-vars */
<template>
  <v-app class="Register">
    <v-layout align-center justify-center class="blue lighten-4">
      <v-card
        v-resize="btnSize"
        :width="cardWidth"
        fill-height
        class="mx-auto mt-5"
      >
        <v-container>
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
              <v-dialog
                v-model="RegDialog"
                persistent
                max-width="600px"
                @keydown.esc="setRegDialog(false)"
              >
                <template v-slot:activator="{ on }">
                  <v-btn
                    :x-small="xs"
                    :small="s"
                    ::medium="md"
                    :large="lg"
                    :x-large="xl"
                    color="info"
                    dark
                    v-on="on"
                    @click="setDialog"
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
                    <v-container>
                      <v-row dense>
                        <v-btn
                          color="blue darken-1"
                          text
                          @click="setRegDialog(false)"
                          >Close</v-btn
                        >
                      </v-row>
                    </v-container>
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
            <v-container>
              <v-row dense>
                <v-btn
                  :x-small="xs"
                  :small="s"
                  :medium="md"
                  :large="lg"
                  :x-large="xl"
                  color="success"
                  @click="passwordCheck(password)"
                  :loading="registerBtnLoad"
                  >Register</v-btn
                >
                <v-spacer></v-spacer>
                <v-btn
                  :x-small="xs"
                  :small="s"
                  :medium="md"
                  :large="lg"
                  :x-large="xl"
                  color="red white--text"
                  to="/"
                >
                  Cancel</v-btn
                >
              </v-row>
            </v-container>
          </v-card-actions>
        </v-container>
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
  mounted() {},
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
    xs: false,
    s: false,
    md: false,
    lg: false,
    xl: false,
    registerBtnLoad: false,
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
        try {
          if (this.file) {
            const reader = new FileReader();
            reader.readAsDataURL(this.file);
            reader.onloadend = async () => {
              data.image = await this.uploadImage2(reader.result);
              var url = `/user/addUser`;

              axios
                .post(url, data)
                .then(() => {
                  setTimeout(() => {}, 200);
                  this.$router.push("/");
                  this.registerBtnLoad = false;
                })
                .catch((err) => {
                  console.log(err);
                  this.registerBtnLoad = false;
                });
            };
            reader.onerror = () => {
              console.error("AHHHHHHHH!!");
            };
            // this.uploadImage(formData);
          } else {
            var url = `/user/addUser`;

            axios
              .post(url, data)
              .then(() => {
                setTimeout(() => {}, 200);
                this.$router.push("/");
                this.registerBtnLoad = false;
              })
              .catch((err) => {
                console.log(err);
                this.valid2 = true;
              });
          }
        } catch (err) {
          console.log(err);
          this.registerBtnLoad = false;
        }
      } else {
        this.valid = false;
        this.registerBtnLoad = false;
      }
    },
    // async uploadImage2(base64EncodedImage) {
    //   try {
    //     const data = await axios({
    //       url: "/user/upload",
    //       method: "post",
    //       data: JSON.stringify({ data: base64EncodedImage }),
    //       headers: { "Content-Type": "application/json" },
    //     });

    //     return data.data.secure_url;
    //   } catch (err) {
    //     console.error(err);
    //   }
    // },
    btnSize() {
      setTimeout(() => {
        this.cardWidth = window.outerWidth * 0.3;
        this.xs = false;
        this.s = false;
        this.md = false;
        this.lg = false;
        this.xl = false;

        switch (this.$vuetify.breakpoint.name) {
          case "xs":
            this.cardWidth = window.outerWidth;
            return (this.s = true);
          case "sm":
            return (this.s = true);
          case "md":
            return (this.md = true);
          case "lg":
            return (this.md = true);
          case "xl":
            return (this.lg = true);
          default:
            return (this.md = true);
        }
      }, 500);
    },
    passwordCheck() {
      this.valid3 = false;
      this.valid = true;
      this.registerBtnLoad = true;
      if (this.password.length >= 4) {
        this.addUser();
      } else {
        this.registerBtnLoad = false;
        this.valid3 = true;
      }
    },
    setDialog() {
      this.setRegDialog(true);
    },
    ...mapActions(["setRegDialog", "uploadImage2"]),
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
  },
};
</script>
