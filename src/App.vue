<template>
  <v-app class="grey lighten-4" v-resize="onResize">
    <Navbar />
    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>
import Navbar from "@/components/Navbar";
//import Landing from "./views/Landing"
export default {
  name: "App",
  components: {
    Navbar,
  },
  data: () => ({}),
  methods: {
    onResize() {},
  },
};
</script>
