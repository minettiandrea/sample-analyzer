<template>
  <v-card class="mx-auto">
    <v-card-title>
      <v-icon large left>mdi-twitter</v-icon>
      <span class="title font-weight-light">Spectrum presenter</span>
    </v-card-title>
    <v-card-text>This component is responsable to show the spectrum of the sample<br>Example injection {{test}}</v-card-text>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'

@Component
export default class SpectrumPresenter extends Vue {
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: SpectralExtractor;

    test = this.spectralExtractor.test();
}
</script>

<style lang="sass" scoped>

</style>
