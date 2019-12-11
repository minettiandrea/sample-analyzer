<template>
  <v-card class='mx-auto col-12 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Rhthmic schema</span>
    </v-card-title>
    <v-card-text>Show rhythmic schema.</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class SchemaPresenter extends Vue {
}
</script>
