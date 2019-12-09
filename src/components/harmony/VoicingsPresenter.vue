<template>
  <v-card class="mx-auto col-10 space-around">
    <v-card-title>
      <v-icon large left></v-icon>
      <span class="title font-weight-light">Suggested voicing</span>
    </v-card-title>
    <v-card-text>Suggested voicing for specific sound loaded</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'

@Component
export default class VoicingsPresenter extends Vue {
}
</script>

<style lang="sass" scoped>

</style>
