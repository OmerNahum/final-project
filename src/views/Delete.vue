<template>
  <v-app class="delete">
    <v-card width="400" class="mx-auto mt-5">
      <v-card-title>
        <h1 class="font-weight-light red--text">Delete</h1>
      </v-card-title>
      <v-card-text>
        <v-form>
          <v-text-field v-model="userName" label="UserName" />
          <v-text-field
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Password"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            @click:append="showPassword = !showPassword"
          />
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-btn class="mb-2" color="error" @click="preDelete" to="/Delete"
          >Delete</v-btn
        >
      </v-card-actions>
      <span class="red--text" v-if="valid1">deleted</span>
      <span class="red--text" v-if="valid2">
        Username or password incorrect</span
      >
    </v-card>
  </v-app>
</template>

<script>
// @ is an alias to /src

var $ = require("jquery");
export default {
  name: "Delete",
  components: {},

  data: () => ({
    showPassword: false,
    userName: "",
    password: "",
    valid1: false,
    valid2: false,
    route: ""
  }),

  methods: {
    deleteUser() {
      this.valid1 = false;
      this.valid2 = false;
      if (this.userName != "" && this.password != "") {
        var self = this;
        var url = `http://localhost:3000/user/deleteUser?username=${self.userName}&password=${self.password}`;

        $.post(url, function(res) {
          var error = res;
          if (error == "failed") {
            self.valid2 = !self.valid2;
          }
        }).fail(function() {
          self.valid1 = false;
          self.valid2 = true;
        });
      } else {
        this.valid2 = true;
      }
    },
    preDelete() {
      this.valid1 = false;
      this.valid2 = false;
      if (this.userName != "" && this.password != "") {
        this.deleteUser();
        this.valid1 = true;
        this.restart()
      } else {
        this.valid2 = true;
      }
    },
    restart() {
      this.password = "";
      this.userName = "";
    }
  }
};
</script>
