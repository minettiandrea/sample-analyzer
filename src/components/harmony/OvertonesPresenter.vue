<template>
<v-card class='mx-auto col-5 space-around'>
    <v-card-title>
      <v-icon large left color='orange darken-2'>fab fa-itunes-note</v-icon>
      <span class="title font-weight-light">Overtones presenter</span>
    </v-card-title>
    <v-card-text>This is going to draw a pentagram with the overtones of the sound loaded.</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
// import { Vex } from 'vexflow'

@Component
export default class OvertonesPresenter extends Vue {
}
</script>
