/* eslint-disable no-unused-vars */
<template>
  <div class="Contacts" v-resize="btnSize">
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
      <v-btn class="mt-1" small depressed append color="success" @click="load"
        >Load-all-Users
      </v-btn>
      <div>
        <v-dialog v-model="dialog1" persistent max-width="600px">
          <template v-slot:activator="{}">
            <v-btn
              :class="addContactMg"
              :x-small="xs"
              :small="s"
              :medium="s"
              :large="lg"
              :x-large="xl"
              color="info"
              dark
              @click="restartValid"
              >Add contact</v-btn
            >
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
                      @keydown.enter="onSave"
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
              <v-btn
                color="blue darken-1"
                text
                @click="onSave"
                Add
                :loading="addContactLoad"
                >Save</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-dialog v-model="dialog" persistent max-width="600px">
          <template v-slot:activator="{}">
            <v-btn
              :loading="isLoading"
              :x-small="xs"
              :small="s"
              :medium="s"
              :large="lg"
              :x-large="xl"
              color="purple"
              dark
              @click="setChooser(2)"
              >Recommended Groups</v-btn
            >
            <v-btn
              :loading="isLoading1"
              :x-small="xs"
              :small="s"
              :medium="s"
              :large="lg"
              :x-large="xl"
              color="brown"
              :class="recommendedConMg"
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
        <v-btn
          icon
          color="red"
          @click="deleteCon(item._id)"
          :loading="deleteConLoad"
        >
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
    addContactLoad: false,
    deleteConLoad: false,
    xs: false,
    s: false,
    md: false,
    lg: false,
    xl: false,
    addContactMg: "",
    recommendedConMg: "",
  }),
  methods: {
    load() {
      this.user = this.User;
      this.users = this.Contacts;
      this.searchedUsers = this.Contacts;
      this.deleteConLoad = false;
    },
    searchUsers() {
      this.searchedUsers = this.users.filter((u) =>
        u.firstName.startsWith(this.name)
      );
    },
    create() {
      this.updateContacts(this.selected);

      this.$router.push("/Add");
    },
    async onSave() {
      this.addContactLoad = true;
      this.valid = true;
      this.existValid = false;
      if (this.contactEmail != "") {
        if (this.contactEmail !== this.user.email) {
          try {
            await this.addContact(this.contactEmail);

            const message = this.Valid;

            if (this.Valid == "") {
              this.dialog1 = false;
              this.dialog = false;
              this.load();
              this.addContactLoad = false;
            } else if (message == "Unregistered user") {
              this.addContactLoad = false;
              this.valid = false;
            } else if (message == "already exist") {
              this.addContactLoad = false;
              this.existValid = true;
            }
          } catch (error) {
            console.log("vue add contact error");
            this.addContactLoad = false;
          }
        } else {
          this.existValid = true;
          this.addContactLoad = false;
        }
      } else {
        this.valid = false;
        this.addContactLoad = false;
      }
    },
    async onSaveRec() {
      this.dialog = false;
      if (this.chooser == 2) {
        if (this.recSelection.length > 0) {
          this.selected = this.recSelection;
          this.create();
        } else {
          this.dialog = false;
        }
      } else if (this.chooser == 1) {
        if (this.recSelection.length > 0) {
          await this.addContact(this.recSelection);
          this.load();
        } else {
          this.dialog1 = false;
        }
      }
    },
    async deleteCon(id) {
      this.deleteConLoad = true;
      await this.deleteContact(id);

      this.load();
    },
    restartValid() {
      this.dialog1 = true;
      this.valid = true;
      this.setValid("");
    },
    async getRecommended() {
      if (this.chooser == 1) {
        this.isLoading1 = true;
        await this.setRecommendedContacts();
        this.recommended = this.Recommended;
        while (!this.recommended);
        //await this.addContact(this.recommended);
        this.isLoading1 = false;
        this.dialog = true;
      } else {
        if (this.users.length > 0) {
          this.isLoading = true;
          try {
            await this.setRecommendedGroups();
            this.recommended = this.Recommended;
            while (!this.recommended);
            this.isLoading = false;
            this.dialog = true;
          } catch (error) {
            console.log("cant find recommended");
            this.isLoading = false;
          }
        } else {
          this.recommended = [];
          this.dialog = true;
        }
      }
    },
    btnSize() {
      setTimeout(() => {
        this.xs = false;
        this.s = false;
        this.md = false;
        this.lg = false;
        this.xl = false;

        switch (this.$vuetify.breakpoint.name) {
          case "xs":
            this.addContactMg = "ml-1";

            return (this.xs = true);
          case "sm":
            return (this.s = true);
          case "md":
            this.addContactMg = "mr-1";
            this.recommendedConMg = "mr-1";
            return (this.s = true);
          case "lg":
            this.recommendedConMg = "mr-1";
            this.addContactMg = "mr-1";
            return (this.md = true);
          case "xl":
            this.addContactMg = "mr-1";
            this.recommendedConMg = "mr-1";
            return (this.md = true);
          default:
            return (this.s = true);
        }
      }, 500);
    },
    setChooser(number) {
      console.log(number);
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
