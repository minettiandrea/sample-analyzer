<template>
  <v-card class="mx-auto col-5 center">
      <div class='wrapper'
      ref='wrapper-spectrum'
      @click='test'>
        <canvas ref='spectrum'>
        </canvas>
    </div>

  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { Component, Ref } from 'vue-property-decorator'
import { Store } from '@/services/store/store'
import { AudioContextProvider } from '../../services/providers/context-provider'
import { inject } from 'inversify-props'
import { REGISTRY } from '@/ioc/registry'
import { DummySpectralExtractor } from '@/services/spectral-extractor/spectral-extractor-impl'
import { FFTR } from 'kissfft-js'

@Component
export default class SpectrumPresenter extends Vue {
    @inject(REGISTRY.SpectralExtractor) spectralExtractor: DummySpectralExtractor;
    @inject(REGISTRY.Store) store:Store

    @Ref('spectrum') readonly canvasspec!: HTMLCanvasElement

    private sample:AudioBuffer
    private data:Float64Array

    created () {
      this.store.sample().subscribe(ab => {
        if (ab) {
          this.sample = ab
          const data = this.sample.getChannelData(0) // #TODO take the average
          const fftr = new FFTR(data.length)
          const Data = fftr.forward(Array.from(data))
          console.log(Data)
        }
      })
    }

    test () {

    }
}
</script>

<style lang="sass" scoped>

</style>
