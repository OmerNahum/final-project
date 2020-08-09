/* eslint-disable no-unused-vars */
<template>
  <div class="Contacts">
    <h1 class="grey--text font-weight-light">Contacts</h1>
    <v-card width="400" class="weight-light">
      <v-text-field
        v-model="name"
        single-line
        hide-details
        class="serach"
        label="Search by username"
        append-icon="mdi-magnify"
      ></v-text-field>
      <v-btn x-small color="info" @click="searchUsers(name)">search</v-btn>
    </v-card>
    <div class=" d-flex justify-space-between">
      <v-btn small depressed append color="success" @click="load"
        >Load-all-Users
      </v-btn>
      <div>
        <v-dialog v-model="dialog1" persistent max-width="600px">
          <template v-slot:activator="{}">
            <v-btn color="info" dark @click="restartValid">Add contact</v-btn>
          </template>
          <v-card>
            <v-card-title>
              <span class="headline">Contact</span>
            </v-card-title>
            <v-card-text>
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field
                      v-model="contactEmail"
                      label="contact email"
                      required
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
            <v-card-text class="red--text" v-if="valid == false"
              >User does not exist
            </v-card-text>
            <v-card-text class="red--text" v-if="existValid == true"
              >Contact already exist
            </v-card-text>
            <v-card-actions>
              <v-btn color="blue darken-1" text @click="dialog1 = false"
                >Close</v-btn
              >
              <v-btn color="blue darken-1" text @click="onSave">Save</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialog" persistent max-width="600px">
          <template v-slot:activator="{}">
            <v-btn
              :loading="isLoading"
              color="purple"
              dark
              @click="setChooser(2)"
              >Recommended Groups</v-btn
            >
            <v-btn
              :loading="isLoading1"
              color="brown"
              dark
              @click="setChooser(1)"
              >Recommended contact</v-btn
            >
          </template>
          <v-data-table
            v-model="recSelection"
            :items="recommended"
            :headers="headers"
            show-select
            item-key="email"
            class="elevation-1"
          >
            <template #item.contact="{item}">
              <v-avatar size="30">
                <img :src="item.image" />
              </v-avatar>
              {{ item.firstName }}
            </template>
            <template #item.second="{item}">
              {{ item.email }}
            </template>
          </v-data-table>
          <v-card-actions>
            <v-btn color="blue darken-1" text @click="dialog = false"
              >Close</v-btn
            >
            <v-btn color="blue darken-1" text @click="onSaveRec">Save</v-btn>
          </v-card-actions>
        </v-dialog>
      </div>
    </div>
    <v-data-table
      v-model="selected"
      :items="searchedUsers"
      :headers="headers"
      show-select
      item-key="email"
      class="elevation-1"
    >
      <template #item.contact="{item}">
        <v-avatar size="30">
          <img :src="item.image" />
        </v-avatar>
        {{ item.firstName }}
      </template>
      <template #item.second="{item}">
        {{ item.email }}
      </template>
      <template #item.action="{item}">
        <v-btn icon color="red" @click="deleteCon(item._id)">
          <v-icon small>
            mdi-delete
          </v-icon>
        </v-btn>
      </template>
    </v-data-table>

    <v-btn class="success" @click="create">Create</v-btn>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
// @ is an alias to /src
//import User from "../components/User"
//var $ = require("jquery");

export default {
  async created() {
    await this.getAllUsers();
    this.load();
  },
  computed: {
    ...mapGetters(["User", "Valid", "Contacts", "Recommended"]),
  },
  name: "Contacts",
  data: () => ({
    headers: [
      { text: "Contact", align: "start", value: "contact" },
      { text: "Email", value: "second" },
      { text: "Action", value: "action" },
    ],
    name: "",
    dialog: false,
    dialog1: false,
    user: null,
    users: [],
    searchedUsers: [],
    contactEmail: "",
    singleSelect: false,
    selected: [],
    recSelection: [],
    recommended: [],
    chooser: -1,
    valid: true,
    existValid: null,
    isLoading: false,
    isLoading1: false,
  }),
  methods: {
    load() {
      this.user = this.User;
      this.users = this.Contacts;
      this.searchedUsers = this.Contacts;
    },
    searchUsers() {
      this.searchedUsers = this.users.filter((u) =>
        u.name.startsWith(this.name)
      );
    },
    create() {
      console.log("create selected", this.selected);
      this.updateContacts(this.selected);
      this.$router.push("/Add");
    },
    async onSave() {
      this.valid = true;
      this.existValid = false;

      try {
        await this.addContact(this.contactEmail);

        console.log(this.Valid);
        const message = this.Valid;

        if (this.Valid == "") {
          this.dialog1 = false;
          this.dialog = false;
          this.load();
        } else if (message == "Unregistered user") {
          this.valid = false;
        } else if (message == "already exist") {
          console.log("else if exist");
          this.existValid = true;
        }
      } catch (error) {
        console.log("vue add contact error");
      }
    },
    async onSaveRec() {
      console.log("onSaveRec selection", this.selected);
      this.dialog = false;
      if (this.chooser == 2) {
        this.selected = this.recSelection;
        this.create();
      } else if (this.chooser == 1) {
        console.log(this.recSelection);
        await this.addContact(this.recSelection);
        this.load();
      }
    },
    async deleteCon(id) {
      await this.deleteContact(id);
      console.log(this.User);
      this.load();
    },
    restartValid() {
      this.dialog1 = true;
      this.valid = true;
      this.setValid("");
    },
    async getRecommended() {
      console.log(this.chooser);
      if (this.chooser == 1) {
        this.isLoading1 = true;
        await this.setRecommendedContacts();
        this.recommended = this.Recommended;
        while (!this.recommended);
        //await this.addContact(this.recommended);
        this.isLoading1 = false;
        this.dialog = true;
      } else {
        this.isLoading = true;
        await this.setRecommendedGroups();
        //console.log(this.Recommended);
        this.recommended = this.Recommended;
        while (!this.recommended);
        this.isLoading = false;
        this.dialog = true;
      }
    },
    setChooser(number) {
      this.chooser = number;
      this.getRecommended();
    },
    ...mapActions([
      "updateContacts",
      "addContact",
      "getAllUsers",
      "deleteContact",
      "setValid",
      "setRecommendedGroups",
      "setRecommendedContacts",
    ]),
  },
};
</script>
