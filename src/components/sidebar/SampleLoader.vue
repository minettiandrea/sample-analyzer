<template>
  <v-card class="mx-auto">
    <v-card-title>
      <v-icon large left>mdi-twitter</v-icon>
      <span class="title font-weight-light">Sample loader</span>
    </v-card-title>
    <v-card-text>
      <v-file-input @change="load" label="File input"></v-file-input>
    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { REGISTRY } from '../../ioc/registry'
import { inject } from 'inversify-props'
import { SampleLoaderService } from '../../services/sample-loader/sample-loader'
import { Store } from '@/services/store/store'

@Component
export default class SampleLoader extends Vue {
  @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService;
  @inject(REGISTRY.Store) store:Store

  load (file:File) {
    this.sampleLoader.loadFromFile(file).then(ab => {
      this.store.nextSample(ab)
    })
  }
}
</script>

<style lang="sass" scoped>

</style>
