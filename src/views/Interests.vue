<template>
  <div class="Interests">
    <v-data-table
      v-model="selected"
      :items="interests"
      :headers="headers"
      show-select
      item-key="value"
      class="elevation-1"
    >
      <template #item.Interests="{item}">
        <v-icon>
          {{ item.icon }}
        </v-icon>
        {{ item.name }}
      </template>
    </v-data-table>
    <v-btn large color="success" @click="selectedHandler">Done</v-btn>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

export default {
  data: () => ({
    selected: [],
    interests: [
      { name: "sport", icon: "mdi-basketball", value: 1 },
      { name: "study", icon: "mdi-book-open-page-variant", value: 2 },
      { name: "clubs", icon: "mdi-glass-cocktail", value: 3 },
      { name: "nature", icon: "mdi-airballoon", value: 4 },
      { name: "pubs", icon: "mdi-glass-mug", value: 5 },
      { name: "gaming", icon: "mdi-controller-classic-outline", value: 6 },
      { name: "food", icon: "mdi-food-fork-drink", value: 7 },
      { name: "movies", icon: "mdi-movie-roll", value: 8 },
      { name: "shopping", icon: "mdi-shopping", value: 9 },
      { name: "music", icon: "mdi-music", value: 10 },
    ],
    headers: [{ text: "Interests", value: "Interests" }],
    vec: [],
  }),
  computed: {
    ...mapGetters(["User", "RegDialog"]),
  },
  methods: {
    async selectedHandler() {
      this.vec = [];
      let i = 0;
      if (this.selected.length > 0) {
        for (let j = 1; j <= this.interests.length; j++) {
          if (this.selected[i] != null && this.selected[i].value == j) {
            this.vec.push(1);
            i++;
          } else {
            this.vec.push(0);
          }
        }
      } else {
        this.vec.length = this.interests.length;
        this.vec.fill(0);
      }

      await this.currentUser();
      if (this.User) {
        this.setInterests({ vector: this.vec, user: this.User });
        this.$router.push("/Show");
      } else {
        console.log("regDialog");
        console.log(this.vec);
        this.setInterests({ vector: this.vec, user: null });
        this.setRegDialog(false);
      }
    },
    ...mapActions(["setInterests", "currentUser", "setRegDialog"]),
  },
};
</script>
