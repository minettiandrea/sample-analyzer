<template>
  <v-card class="mx-auto">
    <v-card-title>
      <v-icon large left>mdi-twitter</v-icon>
      <span class="title font-weight-light">Sample loader</span>
    </v-card-title>
    <v-card-text>
      <v-file-input @change="load" label="File input"></v-file-input>

      <v-list>
      <v-subheader>EXAMPLES</v-subheader>
      <v-list-item-group color="primary">
        <v-list-item
          v-for="(item, i) in examples"
          :key="i"
        >
          <v-list-item-content>
            <v-list-item-title v-text="item.name" v-on:click="selectSample(item)"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>

    </v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { REGISTRY } from '../../ioc/registry'
import { inject } from 'inversify-props'
import { SampleLoaderService } from '../../services/sample-loader/sample-loader'
import { Store, Example } from '@/services/store/store'

@Component
export default class SampleLoader extends Vue {
  @inject(REGISTRY.SampleLoader) sampleLoader:SampleLoaderService;
  @inject(REGISTRY.Store) store:Store

  examples = this.store.sampleExamples()

  selectSample (s:Example) {
    this.store.setLoading()
    this.sampleLoader.loadFromUrl(s.url).then(ab => {
      this.store.nextSample(ab)
    })
  }

  load (file:File) {
    this.store.setLoading()
    this.sampleLoader.loadFromFile(file).then(ab => {
      this.store.nextSample(ab)
    })
  }
}
</script>

<style lang="sass" scoped>

</style>
