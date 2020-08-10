/* eslint-disable vue/no-unused-vars */
<template>
  <div class="show">
    <h1 class="grey--text font-weight-light">Groups</h1>
    <v-card width="400" class="weight-light">
      <v-text-field
        v-model="name"
        single-line
        hide-details
        class="serach"
        label="Search by group name"
        append-icon="mdi-magnify"
      ></v-text-field>
      <v-btn x-small color="info" @click="searchGroup">search</v-btn>
    </v-card>
    <span class="mt-5">
      <v-btn x-small depressed append color="purple" @click="load"
        >Load-all-Groups
      </v-btn>
    </span>

    <v-card-title
      v-if="isEmpty && groups.length == 0"
      class="justify-center font-size-6em"
      >There are no active groups</v-card-title
    >
    <v-data-table
      :items="searchedGroups"
      class="elevation-1"
      :headers="headers"
      v-if="groups != null && groups.length != 0"
      :loading="isLoading"
    >
      <template #item.GroupName="{item}">
        <a :href="item.image" target="_blank">
          <v-avatar size="30">
            <img :src="item.image" />
          </v-avatar>
        </a>
        <a color="blue" @click="tranGroup(item._id)">
          {{ item.name }}
        </a>
        <span
          v-if="
            !item.viewed.find(
              (view) => view._id.toString() === user._id.toString()
            ).isViewed
          "
          title="New messages"
          >🔴</span
        >
      </template>
      <template #item.Actions="{ item }">
        <v-btn icon color="blue" @click="tranGroup(item._id)">
          <v-icon small class="mr-2">
            mdi-message
          </v-icon>
        </v-btn>
        <v-btn
          icon
          color="red"
          :loading="deleteLoader"
          @click="deleteGroup(item._id)"
        >
          <v-icon small>
            mdi-delete
          </v-icon>
        </v-btn>
        <v-btn
          icon
          color="red"
          :loading="foreverLoader"
          @click="checkAdmin(item._id)"
        >
          <v-icon
            title="Delete group for all participants"
            small
            v-if="item.admin.toString() === user._id.toString()"
          >
            mdi-delete-forever
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
// @ is an alias to /src

//var $ = require("jquery");
//var axios = require("axios");
import { mapGetters } from "vuex";
import { mapActions } from "vuex";
import io from "socket.io-client";
import moment from "moment";

export default {
  async created() {
    this.socket = io("http://localhost:3000");

    this.socket.on("change", (group) => {
      return this.setGroups(group);
    });

    this.socket.on("groupDeleted", () => {
      return this.setGroups(null);
    });
    await this.getAllGroups();
    this.deleteLoader = false;
    this.foreverLoader = false;
    this.load();
  },
  name: "Show",
  components: {},
  mounted() {
    setTimeout(() => {
      this.setLastSeen();
    }, 500);
  },
  computed: {
    ...mapGetters(["User", "Groups"]),
  },
  data: () => ({
    user: null,
    users: [],
    searchedGroups: [],
    headers: [
      { text: "GroupName", value: "GroupName" },
      {
        text: "Actions",
        value: "Actions",
      },
    ],
    name: "",
    groups: [],
    isLoading: false,
    isEmpty: false,
    deleteLoader: false,
    foreverLoader: false,
    socket: null,
    moment: moment,
  }),

  methods: {
    async load() {
      this.isLoading = true;

      this.groups = await this.Groups;
      while (!this.groups);

      this.isLoading = false;
      if (this.groups.length == 0) this.isEmpty = true;
      this.searchedGroups = await this.Groups;

      this.user = this.User;

      this.deleteLoader = false;
      this.foreverLoader = false;
    },

    async setGroups(group) {
      if (group) {
        for (let i = 0; i < this.groups.length; i++) {
          if (group.group._id.toString() === this.groups[i]._id.toString()) {
            this.groups[i] = group.group;
          }
        }
      }

      //this.searchedGroups = this.groups;
      await this.getAllGroups();
      let groups = await this.Groups;
      if (group) {
        groups = groups.filter((g) => {
          return g._id.toString() !== group.group._id.toString();
        });
        groups.unshift(group.group);
      }

      await this.setGroupsPosition(groups);

      this.load();
    },
    searchGroup() {
      this.searchedGroups = [];

      this.searchedGroups = this.groups.filter((group) =>
        group.name.startsWith(this.name)
      );
    },
    async deleteGroup(id) {
      this.deleteLoader = true;
      await this.leaveGroup(id);

      await this.getAllGroups();
      this.load();
    },
    async checkAdmin(id) {
      this.foreverLoader = true;
      const group = this.groups.filter(
        (group) => group._id.toString() == id.toString()
      );
      const isAdmin = group.filter((group) => group.admin == this.user._id);
      if (isAdmin.length > 0) {
        await this.adminDeleteGroup(group.pop()._id);
        this.socket.emit("onGroupDelete");
        this.load();
      } else alert("only admin can delete group");
    },
    async tranGroup(groupId) {
      await this.getGroup(groupId);
      this.$router.push("/chat");
    },
    ...mapActions([
      "currentUser",
      "getSearchedGroups",
      "getAllGroups",
      "leaveGroup",
      "adminDeleteGroup",
      "getGroup",
      "setLastSeen",
      "setGroupsPosition",
    ]),
  },
  async beforeDestroy() {
    // await this.socket.emit("lastSeen", {
    //   time: this.moment(Date.now()).format("MMMM Do YYYY, h:mm:ss"),
    //   u: this.user,
    // });
    // this.socket.on("updateFinished", () => {
    //   this.socket.close();
    // });

    setTimeout(() => {
      this.setLastSeen();
    }, 500);
    this.socket.close();
  },
};
</script>
