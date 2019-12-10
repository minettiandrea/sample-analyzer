<template>
  <v-card class='mx-auto col-10 mt-5 space-around'>
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Show waveform</span>
    </v-card-title>
    <v-card-text>Show waveform in time domain.</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class WaveformPresenter extends Vue {
}
</script>
