<template>
  <div class="hello">
    Test service: {{msg}}
  </div>
</template>

<script lang="ts">
import 'reflect-metadata' // Import only once
import { Component, Prop, Vue } from 'vue-property-decorator'
import { inject } from 'inversify-props'
import { SpectralExtractor } from '@/services/spectral-extractor/spectral-extractor'
import { REGISTRY } from '../registry'

@Component
export default class HelloWorld extends Vue {
  @inject(REGISTRY.SpectralExtractor) spectralExtractor: SpectralExtractor;

  msg: string = this.spectralExtractor.test();
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">

</style>
