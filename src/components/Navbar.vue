<template>
  <nav v-resize="check">
    <v-toolbar v-if="this.navbar">
      <v-app-bar-nav-icon
        class="grey--text"
        @click="drawer = !drawer"
      ></v-app-bar-nav-icon>
      <a @click="pushToShow">
        <v-toolbar-title class="text-uppercase green--text">
          <span class="font-weight-bold">Down's For</span>
        </v-toolbar-title>
      </a>
      <v-spacer></v-spacer>
      <v-btn class="red white--text" small @click="this.userLogout"
        >Logout</v-btn
      >
    </v-toolbar>

    <v-navigation-drawer app class="d-lg-flex" v-model="drawer" color="indigo">
      <v-list>
        <v-btn small color="info darken-1" @click="drawer = false">
          <v-icon>
            mdi-menu-open
          </v-icon>
        </v-btn>
        <v-list-item
          v-for="link in links"
          :key="link.text"
          :to="link.route"
          @click="drawer = false"
        >
          <v-list-item-action>
            <v-icon>{{ link.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>{{ link.text }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </nav>
</template>

<script>
//var $ = require("jquery");
import { mapActions } from "vuex";
import { mapGetters } from "vuex";

export default {
  created() {
    console.log("Navbar");
    //this.check();
  },
  props: [],
  computed: { ...mapGetters(["navbar"]) },
  data: () => ({
    //tf: false,
    drawer: false,
    users: [],
    links: [
      {
        icon: "mdi-account",
        text: "Profile",
        route: "/Profile",
      },
      { icon: "mdi-account-group", text: "Grpups", route: "/Show" },
      { icon: "mdi-account-plus", text: "Create Group", route: "/Contacts" },
      // { icon: "mdi-account-remove", text: "Delete-Group", route: "/Delete" },
      {
        icon: "mdi-bookmark",
        text: "Interests",
        route: "/Interests",
      },
      {
        icon: "mdi-contacts",
        text: "Contacts",
        route: "/Contacts",
      },
    ],
  }),
  methods: {
    check() {
      if (this.$route.fullPath == "/" || this.$route.fullPath == "/Register") {
        this.drawer = false;
      }
    },
    ...mapActions(["userLogout"]),
    pushToShow() {
      if (this.$route.path != "/Show") {
        this.$router.push("/Show");
      }
    },
  },
};
</script>
