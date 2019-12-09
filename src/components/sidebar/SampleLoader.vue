<template>
  <v-card class="mx-auto">
    <v-card-title>
      <v-icon large left>mdi-twitter</v-icon>
      <span class="title font-weight-light">Sample loader</span>
    </v-card-title>
    <v-card-text>This component is responsable to load samples from hard drive</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component
export default class SampleLoader extends Vue {}
</script>

<style lang="sass" scoped>

</style>
