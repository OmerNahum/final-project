import Vue from "vue";
import VueRouter from "vue-router";
import Add from "../views/Add.vue";
import Delete from "../views/Delete.vue";
import Show from "../views/Show.vue";
import Edit from "../views/Edit.vue";
import Landing from "../views/Landing.vue";
import Register from "../views/Register.vue";
import Contacts from "../views/Contacts.vue";
import Chat from "../views/Chat.vue";
import Interests from "../views/Interests.vue";
import { store } from "../main";
import Profile from "../views/Profile.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/Add",
    name: "Add",
    component: Add,
  },
  {
    path: "/Delete",
    name: "Delete",
    component: Delete,
  },
  {
    path: "/Show",
    name: "Show",
    component: Show,
  },
  {
    path: "/Edit",
    name: "Edit",
    component: Edit,
  },
  {
    path: "/",
    name: "Landing",
    component: Landing,
  },
  {
    path: "/Register",
    name: "Register",
    component: Register,
  },
  {
    path: "/Contacts",
    name: "Contacts",
    component: Contacts,
  },
  {
    path: "/Chat",
    name: "Chat",
    component: Chat,
  },
  {
    path: "/Interests",
    name: "Interests",
    component: Interests,
  },
  {
    path: "/Profile",
    name: "Profile",
    component: Profile,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});
router.beforeEach(async (to, from, next) => {
  await store.dispatch("currentUser");
  console.log("store user", store.state.user);
  console.log(to.path);
  if (to.path == "/" || to.path == "/Register") store.dispatch("check", false);
  else store.dispatch("check", true);

  if (
    to.path != "/" &&
    to.path != "/Register" &&
    to.path != "/Interests" &&
    !store.state.user
  )
    next({ path: "/" });
  else next();

  if (store.state.user && (to.path == "/" || to.path == "/Register"))
    next({ path: "/Show" });
  else next();
});
export default router;
