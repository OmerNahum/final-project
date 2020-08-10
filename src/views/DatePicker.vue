<template>
  <v-container>
    <v-row>
      <v-col cols="12" lg="6">
        <v-menu
          ref="menu1"
          v-model="menu1"
          :close-on-content-click="false"
          transition="scale-transition"
          offset-y
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              v-model="dateFormatted"
              label="Set new closing date"
              persistent-hint
              prepend-icon="mdi-calendar"
              @blur="date = parseDate(dateFormatted)"
              v-on="on"
            ></v-text-field>
          </template>
          <v-date-picker
            @change="onChange"
            v-model="date"
            no-title
            @input="menu1 = false"
          ></v-date-picker>
        </v-menu>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: (vm) => ({
    date: new Date().toISOString().substr(0, 10),
    dateFormatted: vm.formatDate(new Date().toISOString().substr(0, 10)),
    menu1: false,
    menu2: false,
  }),
  computed: {
    computedDateFormatted() {
      return this.formatDate(this.date);
    },
  },
  watch: {
    date() {
      this.dateFormatted = this.formatDate(this.date);
    },
  },
  methods: {
    formatDate(date) {
      if (!date) return null;
      const [year, month, day] = date.split("-");
      return `${month}/${day}/${year}`;
    },
    parseDate(date) {
      if (!date) return null;
      const [month, day, year] = date.split("/");
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    },
    onChange(date) {
      this.$emit("clicked", date);
    },
  },
};
</script>
