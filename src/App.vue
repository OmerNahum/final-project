<template>
  <v-app class="grey lighten-4" v-resize="onResize">
    <Navbar />
    <v-main>
      <router-view></router-view>
    </v-main>
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
