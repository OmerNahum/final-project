import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

const axios = require("axios");

export const store = new Vuex.Store({
  plugins: [
    createPersistedState({
      storage: window.sessionStorage,
    }),
  ],
  state: {
    user: null,
    navbar: false,
    groups: null,
    chatGroup: null,
    chatPart: null,
    participants: null,
    errorMessage: "",
    contacts: null,
    logs: null,
    interests: null,
    regDialog: false,
    recommended: null,
  },
  mutations: {
    setUser(state, payload) {
      state.user = payload;
    },
    setChatGroup(state, payload) {
      state.chatGroup = payload;
    },
    createGroup(state, payload) {
      state.user.groups = [...state.user.groups, payload.groups];
      console.log(state.user);
    },
    check(state, payload) {
      state.navbar = payload;
    },
    logout(state) {
      state.user = null;
    },
    setGroups(state, payload) {
      state.groups = payload;
    },
    setPart(state, payload) {
      state.participants = payload;
    },
    setContacts(state, payload) {
      state.contacts = payload;
    },
    setErrorMessage(state, payload) {
      state.errorMessage = payload;
    },
    setLogs(state, payload) {
      state.logs = payload;
    },
    chatPart(state, payload) {
      state.chatPart = payload;
    },
    setChat(state, payload) {
      state.chatPart = payload.participants;
      state.chatGroup = payload.group;
    },
    setInterests(state, payload) {
      state.interests = payload;
    },
    setRegDialog(state, payload) {
      state.regDialog = payload;
    },
    setRecommended(state, payload) {
      state.recommended = payload;
    },
  },
  getters: {
    User: (state) => {
      return state.user;
    },
    navbar: (state) => {
      return state.navbar;
    },
    Groups: (state) => {
      return state.groups;
    },
    chatGroup: (state) => {
      return state.chatGroup;
    },
    Participants: (state) => {
      return state.participants;
    },
    Valid: (state) => {
      return state.errorMessage;
    },
    Contacts: (state) => {
      return state.contacts;
    },
    Logs: (state) => {
      return state.logs;
    },
    chatPart: (state) => {
      return state.chatPart;
    },
    Interests: (state) => {
      return state.interests;
    },
    RegDialog: (state) => {
      return state.regDialog;
    },
    Recommended: (state) => {
      return state.recommended;
    },
  },
  actions: {
    async setUser(context, userData) {
      try {
        const payload = await axios.post(`/user/login`, userData);
        console.log(payload.data);
        context.commit("setUser", payload.data);
      } catch (error) {
        console.log("setUser ---------------------", error);
      }
    },
    async setUserBygoogle(context) {
      console.log("googleLogin store");
      const user = await axios.get("user/google");
      context.commit("setUser", user);
    },
    async createGroup(context, groupData) {
      try {
        const payload = await axios.post("/user/createGroup", { groupData });
        context.commit("createGroup", payload);
      } catch (error) {
        console.log("createGroup #############", error);
      }
    },
    async currentUser(context) {
      try {
        const payload = await axios.get("/user/currentUser");
        context.commit("setUser", payload.data);
      } catch (error) {
        console.log("currentUser", error);
      }
    },
    async userLogout(context) {
      await axios.get("/user/logout");
      context.commit("logout");
      window.location.reload();
    },
    check(context, payload) {
      context.commit("check", payload);
    },

    async getAllGroups(context) {
      const payload = await axios.get("/user/getAllGroups");
      context.commit("setGroups", payload.data);
    },
    async setGroupsPosition(context, groups) {
      console.log(groups);
      context.commit("setGroups", groups);
    },

    async getAllUsers(context) {
      const payload = await axios.get("/user/getAllUsers");
      context.commit("setContacts", payload.data);
    },
    async leaveGroup(context, payload) {
      console.log("Vuex leave group");
      const user = await axios.post("/user/leaveGroup", { payload });
      context.commit("setGroups", user.data.groups);
    },
    async adminDeleteGroup(context, groupId) {
      console.log("store groupId", groupId);
      try {
        const groups = await axios.post("/user/adminDeleteGroup", { groupId });
        console.log(groups);
        context.commit("setGroups", groups.data);
      } catch (error) {
        console.log("admin delete failed");
      }
    },
    updateContacts(context, payload) {
      context.commit("setPart", payload);
    },
    async setChatPart(context, partId) {
      const participants = await axios.post("/user/getChatPart", { partId });
      context.commit("chatPart", participants.data);
    },
    async addContact(context, payload) {
      console.log("store onSave");
      console.log(payload);
      try {
        const user = await axios.post("/user/addContact", { payload: payload });
        console.log(user.data);
        context.commit("setContacts", user.data);
      } catch (err) {
        console.log("AddContact error");
        console.log(err.response.data.message);
        context.commit("setErrorMessage", err.response.data.message);
      }
    },
    async deleteContact(context, contactId) {
      const user = await axios.post("/user/deleteContact", { contactId });
      const contacts = await axios.get("/user/getAllUsers");
      console.log(user);
      context.commit("setUser", user.data);
      console.log(user.data.contacts);
      context.commit("setContacts", contacts.data);
    },
    setValid(context, payload) {
      context.commit("setErrorMessage", payload);
    },
    async getGroup(context, groupId) {
      console.log("store getGroup", groupId);
      const group = await axios.post("/user/getGroup", { groupId });
      console.log(group);
      context.commit("setChatGroup", group.data);
    },
    async createLogs(context, groupId) {
      const messages = await axios.post("/user/getMessages", { groupId });
      console.log(messages);
      context.commit("setLogs", messages.data);
    },
    async deleteChatPart(context, data) {
      try {
        const payload = await axios.post("/user/deleteChatPart", data);
        console.log(payload.data);
        context.commit("setChat", payload.data);
      } catch (error) {
        console.log(error);
      }
    },
    async setInterests(context, data) {
      console.log("store", data.vector);
      console.log("store", data.user);
      console.log("store", data);
      if (data.user != null) {
        axios.post("/user/setInterests", { data: data.vector });
        context.commit("setInterests", data.vector);
      } else {
        context.commit("setInterests", data.vector);
      }
    },
    setRegDialog(context, data) {
      context.commit("setRegDialog", data);
    },
    async setGroupNameAndClosing(context, group) {
      console.log("main.js", group);
      const upGroup = await axios.post("/user/setGroupNameAndClosing", {
        group,
      });
      context.commit("setChatGroup", upGroup.data);
    },
    async setRecommendedContacts(context) {
      const recommended = await axios.get("/user/recommendedContacts");
      context.commit("setRecommended", recommended.data);
    },
    async setRecommendedGroups(context) {
      const recommended = await axios.get("/user/recommendedGroups");
      console.log(recommended);
      context.commit("setRecommended", recommended.data);
    },
    async uploadImage(context, FormData) {
      console.log("formData", FormData);

      try {
        await axios.post("/user/upload", FormData);
      } catch (error) {
        context.commit("setErrorMessage", error);
      }
    },
    async changeProfile(context, profileData) {
      // eslint-disable-next-line no-unused-vars

      try {
        const user = await axios.post("/user/changeProfile", profileData);
        console.log(user);
        context.commit("setUser", user);
      } catch (error) {
        context.commit("setErrorMessage", error);
      }
    },
    async setLastSeen(context) {
      const user = await axios.post("/user/setLastSeen");
      context.commit("setUser", user.data);
    },
  },
});

Vue.config.productionTip = false;
new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount("#app");
