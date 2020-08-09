/* eslint-disable no-unused-vars */ /* eslint-disable no-unused-vars */ /*
eslint-disable no-unused-vars */
<template>
  <v-app class="add mx">
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="display font-weight-light info--text">Edit-User</h1>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field
            class="red--text"
            v-model="oldUserName"
            label="Old-UserName (must eneter for editing)"
          />
          <v-text-field
            v-model="oldPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Old-Password (must eneter for editing)"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          />
          <v-text-field v-model="firstName" label="New-first-name" />
          <v-text-field v-model="lastName" label="New-last-name" />
          <v-text-field v-model="userName" label="New-userName" />
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="New-Password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          />
          <v-text-field
            v-model="confirmPassword"
            :type="showPassword ? 'text' : 'password'"
            label="Confirm-password(required)"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          />
          <v-card-text v-if="password != confirmPassword" class="red--text"
            >new password don't match</v-card-text
          >
          <v-card-text v-if="!valid" class="error--text"
            >Old password or old username incorrect</v-card-text
          >
          <v-btn x-small v-if="valid && valid2" class="info--text" to="/show"
            >edit successed press here to look at table</v-btn
          >
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn color="success" @click="preEdit">Edit</v-btn>
      </v-card-actions>
    </v-card>
  </v-app>
</template>

<script>
// @ is an alias to /src
//import App from '../App';
var $ = require("jquery");

export default {
  name: "Edit",
  components: {},
  data: () => ({
    showPassword: false,
    firstName: "",
    lastName: "",
    oldUserName: "",
    userName: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
    valid: true,
    valid2: false
  }),
  methods: {
    editUser() {
      if (
        this.oldUserName != "" &&
        this.userName &&
        this.password != "" &&
        this.password == this.confirmPassword
      ) {
        var self = this;
        self.valid = true;

        var url = `http://localhost:3000/user/editUser?firstName=${self.firstName}&lastName=${self.lastName}&userName=${self.userName}&oldUserName=${self.oldUserName}&oldPassword=${self.oldPassword}&password=${self.password}`;
        $.post(url, function(res) {
          var error = res.error;
          if (error == "wrong") {
            self.valid = false;
          }
        }).fail(function() {
          self.valid = false;
          self.valid2 = false;
        });
      } else {
        this.valid = false;
      }
    },
    preEdit() {
      if (
        this.oldUserName != "" &&
        this.userName &&
        this.password != "" &&
        this.password == this.confirmPassword
      ) {
        this.editUser();
        this.valid2 = true;
      }
    }
  }
};
</script>
